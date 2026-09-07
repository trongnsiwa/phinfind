-- Add amenities JSONB column to public.shops table
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;
