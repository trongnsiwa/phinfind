-- ============================================================================
-- Migration: Add review tags column and index to public.reviews
-- Feature:   Tier 2.4 - Review Hashtags (SOCIAL_FEATURES_ROADMAP.md)
-- Date:      2026-09-25
-- ============================================================================

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- GIN index for fast tag lookups and intersection queries
CREATE INDEX IF NOT EXISTS idx_reviews_tags
  ON public.reviews USING GIN (tags);

NOTIFY pgrst, 'reload schema';

-- Rollback:
-- DROP INDEX IF EXISTS public.idx_reviews_tags;
-- ALTER TABLE public.reviews DROP COLUMN IF EXISTS tags;
-- NOTIFY pgrst, 'reload schema';
