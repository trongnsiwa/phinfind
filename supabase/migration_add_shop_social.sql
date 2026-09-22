-- ============================================================================
-- Migration: Add social media link columns to public.shops
-- Feature:   Social presence (Facebook, Instagram, TikTok, YouTube, Zalo)
-- Date:      2026-09-22
-- ============================================================================

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS facebook_url  TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url    TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url   TEXT,
  ADD COLUMN IF NOT EXISTS zalo_url      TEXT;

-- Partial index: speeds up "which shops have any social presence" queries
CREATE INDEX IF NOT EXISTS idx_shops_social_present
  ON public.shops (
    (COALESCE(facebook_url, instagram_url, tiktok_url, youtube_url, zalo_url))
  )
  WHERE hidden = false;

NOTIFY pgrst, 'reload schema';

-- Rollback:
-- ALTER TABLE public.shops
--   DROP COLUMN IF EXISTS facebook_url,
--   DROP COLUMN IF EXISTS instagram_url,
--   DROP COLUMN IF EXISTS tiktok_url,
--   DROP COLUMN IF EXISTS youtube_url,
--   DROP COLUMN IF EXISTS zalo_url;
-- DROP INDEX IF EXISTS public.idx_shops_social_present;
-- NOTIFY pgrst, 'reload schema';
