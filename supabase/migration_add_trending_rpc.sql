-- ============================================================================
-- Migration: Add trending_shops and new_shops RPCs
-- Feature:   Trending + Mới được thêm Sections (Tier 2.3)
-- Date:      2026-09-24
-- ============================================================================

-- 1. trending_shops: shops with the most reviews in the last days_back days
CREATE OR REPLACE FUNCTION public.trending_shops(
  days_back INT DEFAULT 7,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  place_id TEXT,
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

-- 2. new_shops: shops ordered by created_at descending
CREATE OR REPLACE FUNCTION public.new_shops(
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  place_id TEXT,
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

-- 3. Permissions
GRANT EXECUTE ON FUNCTION public.trending_shops(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.new_shops(INT) TO anon, authenticated;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Rollback:
-- DROP FUNCTION IF EXISTS public.trending_shops(INT, INT);
-- DROP FUNCTION IF EXISTS public.new_shops(INT);
-- NOTIFY pgrst, 'reload schema';
-- ============================================================================
