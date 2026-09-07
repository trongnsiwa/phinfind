-- Add custom_amenities JSONB column to public.shops table
ALTER TABLE public.shops
ADD COLUMN IF NOT EXISTS custom_amenities JSONB DEFAULT '[]'::jsonb;
