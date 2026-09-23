-- ============================================================================
-- Migration: Add videos JSONB column to public.shops
-- Feature:   Video links (Tier 1.3 MVP)
-- Date:      2026-09-23
-- ============================================================================

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;

-- GIN index on videos using jsonb_path_ops filtered by hidden = false
CREATE INDEX IF NOT EXISTS idx_shops_videos_gin
  ON public.shops USING GIN (videos jsonb_path_ops)
  WHERE hidden = false;

NOTIFY pgrst, 'reload schema';

-- Rollback:
-- DROP INDEX IF EXISTS public.idx_shops_videos_gin;
-- ALTER TABLE public.shops DROP COLUMN IF EXISTS videos;
-- NOTIFY pgrst, 'reload schema';
