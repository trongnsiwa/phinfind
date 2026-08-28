-- Migration: Add created_by and verified columns to public.shops table
-- Date: 2026-08-28

-- 1. Add created_by column referencing profiles
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Add verified column with default false
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 3. Mark pre-existing seeded shops as verified (optional / recommended)
UPDATE public.shops 
SET verified = true 
WHERE created_by IS NULL;

-- 4. Create index on created_by for performance
CREATE INDEX IF NOT EXISTS idx_shops_created_by ON public.shops(created_by);

-- 5. Update RLS policies
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON public.shops;
CREATE POLICY "Allow public read access" ON public.shops
  FOR SELECT USING (true);

-- Allow authenticated users to insert new shops with their user ID
DROP POLICY IF EXISTS "Allow authenticated users to insert shops" ON public.shops;
CREATE POLICY "Allow authenticated users to insert shops" ON public.shops
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own shops
DROP POLICY IF EXISTS "Allow users to update own shops" ON public.shops;
CREATE POLICY "Allow users to update own shops" ON public.shops
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own shops
DROP POLICY IF EXISTS "Allow users to delete own shops" ON public.shops;
CREATE POLICY "Allow users to delete own shops" ON public.shops
  FOR DELETE USING (auth.uid() = created_by);
