-- ============================================================================
-- Migration: migration_refresh_shop_rating.sql
-- Issue: BUG-01 — Shop ratings never update after reviews are submitted
-- Description:
--   Creates a trigger function and trigger on `public.reviews` to automatically
--   recalculate `public.shops.rating` and `public.shops.total_ratings` on review
--   INSERT, UPDATE, or DELETE.
--
-- Key Details:
--   - Defined as SECURITY DEFINER with `search_path = public` to update `public.shops`
--     regardless of client RLS restrictions.
--   - Handles INSERT, UPDATE (including changes to `shop_place_id`), and DELETE.
--   - Rounds ratings to 2 decimal places to fit NUMERIC(3,2).
--   - Coalesces rating and total_ratings to 0 when no reviews exist.
--   - Performs an immediate backfill on all existing shops.
-- ============================================================================

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.refresh_shop_rating()
RETURNS TRIGGER AS $$
DECLARE
  affected_place_ids TEXT[];
BEGIN
  -- Determine which shop(s) need recalculation
  IF TG_OP = 'INSERT' THEN
    affected_place_ids := ARRAY[NEW.shop_place_id];
  ELSIF TG_OP = 'DELETE' THEN
    affected_place_ids := ARRAY[OLD.shop_place_id];
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.shop_place_id IS DISTINCT FROM NEW.shop_place_id THEN
      -- If the review moved shops, recalculate both old and new shops
      affected_place_ids := ARRAY[OLD.shop_place_id, NEW.shop_place_id];
    ELSE
      affected_place_ids := ARRAY[NEW.shop_place_id];
    END IF;
  END IF;

  -- Recalculate average rating and total ratings for affected shop(s)
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
      updated_at = NOW()
  WHERE s.place_id = ANY(affected_place_ids);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Bind the trigger to public.reviews
DROP TRIGGER IF EXISTS trg_refresh_shop_rating ON public.reviews;
CREATE TRIGGER trg_refresh_shop_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.refresh_shop_rating();

-- 3. Backfill all existing shops with current review aggregates
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

/*
-- ============================================================================
-- ROLLBACK SCRIPT
-- ============================================================================
-- Run the following statements to revert this migration:

DROP TRIGGER IF EXISTS trg_refresh_shop_rating ON public.reviews;
DROP FUNCTION IF EXISTS public.refresh_shop_rating();
-- ============================================================================
*/
