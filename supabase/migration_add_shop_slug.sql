-- ==============================================================================
-- Migration: Add Shop Slug
-- Description: Adds a slug column to public.shops, generates human-readable
--              URL slugs transliterating Vietnamese diacritics, and backfills
--              existing records.
-- ==============================================================================

-- 1. Add slug column to public.shops
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Create function to generate deterministic and collision-safe shop slugs
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

-- Grant execution rights
GRANT EXECUTE ON FUNCTION public.generate_shop_slug(TEXT, TEXT) TO authenticated, service_role, anon;

-- 3. Backfill all existing rows that have no slug
UPDATE public.shops
SET slug = public.generate_shop_slug(name, place_id)
WHERE slug IS NULL;

-- 4. Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_shops_slug ON public.shops (slug);

-- 5. Reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- Rollback Instructions
-- ==============================================================================
/*
DROP INDEX IF EXISTS public.idx_shops_slug;
ALTER TABLE public.shops DROP COLUMN IF EXISTS slug;
DROP FUNCTION IF EXISTS public.generate_shop_slug(TEXT, TEXT);
NOTIFY pgrst, 'reload schema';
*/
