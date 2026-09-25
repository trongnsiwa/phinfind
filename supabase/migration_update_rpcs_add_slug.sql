-- ============================================================================
-- Migration: Update RPCs (nearby_shops, trending_shops, new_shops) to return slug
-- Feature:   Shop Slug in URL (prevent leaking internal place_id)
-- Date:      2026-09-25
-- Idempotent: Can be safely re-run multiple times without 42P13 or schema errors
-- ============================================================================

-- 1. Ensure slug column exists on public.shops
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Ensure deterministic and collision-safe slug generation function exists
CREATE OR REPLACE FUNCTION public.generate_shop_slug(p_name TEXT, p_place_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  v_raw TEXT;
  v_clean TEXT;
  v_base TEXT;
  v_slug TEXT;
  v_suffix TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Default to 'quan-ca-phe' when null or empty
  v_raw := NULLIF(trim(p_name), '');
  IF v_raw IS NULL THEN
    v_raw := 'quan-ca-phe';
  END IF;

  -- Lowercase
  v_clean := lower(v_raw);

  -- Transliterate Vietnamese diacritics using standard PhinFind character map
  v_clean := translate(
    v_clean,
    'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
  );

  -- Replace any run of non-alphanumeric characters with a single hyphen
  v_clean := regexp_replace(v_clean, '[^a-z0-9]+', '-', 'g');

  -- Collapse repeated hyphens and trim leading/trailing hyphens
  v_clean := regexp_replace(v_clean, '-+', '-', 'g');
  v_clean := trim(both '-' from v_clean);

  -- Fallback to 'quan-ca-phe' if empty after sanitization
  IF length(v_clean) = 0 THEN
    v_clean := 'quan-ca-phe';
  END IF;

  -- Truncate to a maximum of 70 characters
  v_base := substring(v_clean from 1 for 70);
  v_base := rtrim(v_base, '-');
  IF length(v_base) = 0 THEN
    v_base := 'quan-ca-phe';
  END IF;

  -- Check for collision against public.shops.slug
  SELECT EXISTS (
    SELECT 1 FROM public.shops WHERE slug = v_base
  ) INTO v_exists;

  IF NOT v_exists THEN
    RETURN v_base;
  END IF;

  -- Collision resolution: append '-' || substring(replace(p_place_id, '_', '') from 1 for 6)
  v_suffix := substring(replace(COALESCE(p_place_id, ''), '_', '') from 1 for 6);
  IF length(v_suffix) = 0 THEN
    v_suffix := substring(md5(random()::text) from 1 for 6);
  END IF;

  v_slug := substring(v_base from 1 for (70 - length(v_suffix) - 1)) || '-' || v_suffix;
  v_slug := rtrim(v_slug, '-');

  SELECT EXISTS (
    SELECT 1 FROM public.shops WHERE slug = v_slug
  ) INTO v_exists;

  IF NOT v_exists THEN
    RETURN v_slug;
  END IF;

  -- Still colliding: append an additional 4-char random hex suffix
  LOOP
    v_slug := substring(v_slug from 1 for 65) || '-' || substring(md5(random()::text) from 1 for 4);
    SELECT EXISTS (
      SELECT 1 FROM public.shops WHERE slug = v_slug
    ) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_shop_slug(TEXT, TEXT) TO authenticated, service_role, anon;

-- 3. Backfill any existing shop rows that have a NULL slug
UPDATE public.shops
SET slug = public.generate_shop_slug(name, place_id)
WHERE slug IS NULL;

-- 4. Ensure unique index on slug exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_shops_slug ON public.shops (slug);

-- 5. Explicitly DROP each function before recreation to prevent PostgreSQL 42P13
-- ("cannot change return type of existing function") when modifying RETURNS TABLE columns.
DROP FUNCTION IF EXISTS public.nearby_shops(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INT, INT);
DROP FUNCTION IF EXISTS public.trending_shops(INT, INT);
DROP FUNCTION IF EXISTS public.new_shops(INT);

-- 6. nearby_shops: return slug column
CREATE OR REPLACE FUNCTION public.nearby_shops(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT NULL,
  page_limit INT DEFAULT 20,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  place_id TEXT,
  slug TEXT,
  name TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  rating NUMERIC,
  total_ratings INT,
  price_range TEXT,
  photos TEXT[],
  website TEXT,
  phone TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  zalo_url TEXT,
  categories TEXT[],
  amenities JSONB,
  custom_amenities JSONB,
  opening_hours JSONB,
  videos JSONB,
  created_by UUID,
  verified BOOLEAN,
  hidden BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.place_id,
    s.slug,
    s.name,
    s.address,
    s.lat,
    s.lon,
    s.rating,
    s.total_ratings,
    s.price_range,
    s.photos,
    s.website,
    s.phone,
    s.facebook_url,
    s.instagram_url,
    s.tiktok_url,
    s.youtube_url,
    s.zalo_url,
    s.categories,
    s.amenities,
    s.custom_amenities,
    s.opening_hours,
    s.videos,
    s.created_by,
    s.verified,
    s.hidden,
    s.created_at,
    s.updated_at,
    earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(s.lat, s.lon)) AS distance_meters
  FROM public.shops s
  WHERE s.hidden = false
    AND (
      radius_km IS NULL
      OR earth_distance(ll_to_earth(user_lat, user_lon), ll_to_earth(s.lat, s.lon)) <= radius_km * 1000
    )
  ORDER BY distance_meters ASC
  LIMIT page_limit
  OFFSET page_offset;
$$;

-- 7. trending_shops: return slug column
CREATE OR REPLACE FUNCTION public.trending_shops(
  days_back INT DEFAULT 7,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  place_id TEXT,
  slug TEXT,
  name TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  rating NUMERIC,
  total_ratings INT,
  price_range TEXT,
  photos TEXT[],
  website TEXT,
  phone TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  zalo_url TEXT,
  categories TEXT[],
  amenities JSONB,
  custom_amenities JSONB,
  opening_hours JSONB,
  videos JSONB,
  created_by UUID,
  verified BOOLEAN,
  hidden BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  review_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.place_id,
    s.slug,
    s.name,
    s.address,
    s.lat,
    s.lon,
    s.rating,
    s.total_ratings,
    s.price_range,
    s.photos,
    s.website,
    s.phone,
    s.facebook_url,
    s.instagram_url,
    s.tiktok_url,
    s.youtube_url,
    s.zalo_url,
    s.categories,
    s.amenities,
    s.custom_amenities,
    s.opening_hours,
    s.videos,
    s.created_by,
    s.verified,
    s.hidden,
    s.created_at,
    s.updated_at,
    COUNT(r.id)::BIGINT AS review_count
  FROM public.shops s
  LEFT JOIN public.reviews r
    ON r.shop_place_id = s.place_id
    AND r.created_at >= NOW() - (days_back || ' days')::interval
  WHERE s.hidden = false
  GROUP BY s.place_id
  HAVING COUNT(r.id) > 0
  ORDER BY review_count DESC, s.rating DESC
  LIMIT result_limit;
$$;

-- 8. new_shops: return slug column
CREATE OR REPLACE FUNCTION public.new_shops(
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  place_id TEXT,
  slug TEXT,
  name TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  rating NUMERIC,
  total_ratings INT,
  price_range TEXT,
  photos TEXT[],
  website TEXT,
  phone TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  zalo_url TEXT,
  categories TEXT[],
  amenities JSONB,
  custom_amenities JSONB,
  opening_hours JSONB,
  videos JSONB,
  created_by UUID,
  verified BOOLEAN,
  hidden BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.place_id,
    s.slug,
    s.name,
    s.address,
    s.lat,
    s.lon,
    s.rating,
    s.total_ratings,
    s.price_range,
    s.photos,
    s.website,
    s.phone,
    s.facebook_url,
    s.instagram_url,
    s.tiktok_url,
    s.youtube_url,
    s.zalo_url,
    s.categories,
    s.amenities,
    s.custom_amenities,
    s.opening_hours,
    s.videos,
    s.created_by,
    s.verified,
    s.hidden,
    s.created_at,
    s.updated_at
  FROM public.shops s
  WHERE s.hidden = false
  ORDER BY s.created_at DESC
  LIMIT result_limit;
$$;

-- 9. Re-issue all permissions after DROPs
GRANT EXECUTE ON FUNCTION public.nearby_shops(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trending_shops(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.new_shops(INT) TO anon, authenticated;

-- 10. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
