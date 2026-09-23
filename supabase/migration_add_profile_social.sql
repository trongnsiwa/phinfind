-- ============================================================================
-- Migration: Add social media and website link columns to public.profiles
-- Feature:   User social links on public profiles (Tier 2.1)
-- Date:      2026-09-23
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS facebook_url  TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url    TEXT,
  ADD COLUMN IF NOT EXISTS website_url   TEXT;

NOTIFY pgrst, 'reload schema';

-- Rollback:
-- ALTER TABLE public.profiles
--   DROP COLUMN IF EXISTS facebook_url,
--   DROP COLUMN IF EXISTS instagram_url,
--   DROP COLUMN IF EXISTS tiktok_url,
--   DROP COLUMN IF EXISTS website_url;
-- NOTIFY pgrst, 'reload schema';
