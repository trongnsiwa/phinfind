-- ============================================================================
-- Migration: Enforce One Review Per User Per Shop (Google Maps model)
-- Feature:   Reviews Uniqueness Constraint & Deduplication
-- Date:      2026-09-25
--
-- PRE-MIGRATION AUDIT QUERIES
-- NOTE: Run and inspect these queries in the Supabase SQL Editor BEFORE applying
-- this migration to review affected duplicate records and image attachments.
--
-- 1) Count duplicate groups and rows to be removed:
--    SELECT
--      shop_place_id,
--      user_id,
--      COUNT(*) AS total_reviews,
--      COUNT(*) - 1 AS reviews_to_remove
--    FROM public.reviews
--    GROUP BY shop_place_id, user_id
--    HAVING COUNT(*) > 1;
--
-- 2) List exact review IDs and image URLs that will be removed:
--    WITH ranked_reviews AS (
--      SELECT
--        id,
--        shop_place_id,
--        user_id,
--        images,
--        created_at,
--        updated_at,
--        ROW_NUMBER() OVER (
--          PARTITION BY shop_place_id, user_id
--          ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
--        ) AS rank
--      FROM public.reviews
--    )
--    SELECT id, shop_place_id, user_id, images, created_at, updated_at
--    FROM ranked_reviews
--    WHERE rank > 1;
-- ============================================================================

-- 1. Create a table to track orphaned image URLs from removed duplicate reviews
CREATE TABLE IF NOT EXISTS public.orphaned_review_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL,
  shop_place_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Deduplicate existing duplicate reviews, keeping the latest updated_at
-- (tie-breaking by created_at DESC, then id DESC for deterministic resolution)
DO $$
DECLARE
  rec RECORD;
  img_url TEXT;
  deleted_count INTEGER := 0;
BEGIN
  FOR rec IN (
    WITH ranked AS (
      SELECT
        id,
        shop_place_id,
        user_id,
        images,
        ROW_NUMBER() OVER (
          PARTITION BY shop_place_id, user_id
          ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
        ) AS rank
      FROM public.reviews
    )
    SELECT id, shop_place_id, user_id, images
    FROM ranked
    WHERE rank > 1
  ) LOOP
    -- Record orphaned images for follow-up storage bucket cleanup
    IF rec.images IS NOT NULL AND array_length(rec.images, 1) > 0 THEN
      FOREACH img_url IN ARRAY rec.images LOOP
        INSERT INTO public.orphaned_review_images (review_id, shop_place_id, user_id, image_url)
        VALUES (rec.id, rec.shop_place_id, rec.user_id, img_url);
        RAISE NOTICE 'Orphaned review image logged for cleanup: % (review_id: %, user_id: %)',
          img_url, rec.id, rec.user_id;
      END LOOP;
    END IF;

    -- Delete extra duplicate review row
    DELETE FROM public.reviews WHERE id = rec.id;
    deleted_count := deleted_count + 1;
  END LOOP;

  RAISE NOTICE 'Deduplication finished. Removed % duplicate review row(s).', deleted_count;
END $$;

-- 3. Add UNIQUE constraint to enforce one review per user per shop
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uniq_reviews_user_shop'
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT uniq_reviews_user_shop UNIQUE (shop_place_id, user_id);
  END IF;
END $$;

-- 4. Re-run rating aggregates backfill so shops reflect deduped ratings
UPDATE public.shops s
SET rating = COALESCE(
      (SELECT ROUND(AVG(r.rating)::numeric, 2)
       FROM public.reviews r
       WHERE r.shop_place_id = s.place_id),
      0
    ),
    total_ratings = COALESCE(
      (SELECT COUNT(*)::integer
       FROM public.reviews r
       WHERE r.shop_place_id = s.place_id),
      0
    ),
    updated_at = NOW();

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- ROLLBACK SCRIPT
-- ============================================================================
-- IMPORTANT: Deleted duplicate review rows cannot be restored once deleted.
-- To drop the uniqueness constraint and clean up tracking table:
--
-- ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS uniq_reviews_user_shop;
-- DROP TABLE IF EXISTS public.orphaned_review_images;
-- NOTIFY pgrst, 'reload schema';
-- ============================================================================
