-- Migration: Add user role to profiles and hidden status to shops
-- Feature: FEAT-01 Admin/Moderation Panel
-- Date: 2026-09-10

-- 1. Add role column to public.profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Add hidden column to public.shops (used when an admin rejects a shop)
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;

-- 3. Create indexes for role and hidden columns
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_shops_hidden ON public.shops(hidden);

-- 4. Create SECURITY DEFINER helper function to verify if a user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS Policies

-- Allow admins to UPDATE role for any user on public.profiles
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Allow admins to UPDATE any row on public.shops (for verified and hidden toggles)
DROP POLICY IF EXISTS "Admins can update any shop" ON public.shops;
CREATE POLICY "Admins can update any shop" ON public.shops
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- 6. Backfill: set role = 'admin' for the first user by creation date, so there is at least one admin
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM public.profiles
  ORDER BY created_at ASC
  LIMIT 1
);

/*
-- Rollback Migration:
DROP POLICY IF EXISTS "Admins can update any shop" ON public.shops;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP INDEX IF EXISTS public.idx_shops_hidden;
DROP INDEX IF EXISTS public.idx_profiles_role;
ALTER TABLE public.shops DROP COLUMN IF EXISTS hidden;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
*/
