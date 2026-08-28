-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- shops table to store real coffee shop data
CREATE TABLE IF NOT EXISTS public.shops (
  place_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  rating NUMERIC(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  price_range TEXT,
  photos TEXT[],
  website TEXT,
  phone TEXT,
  categories TEXT[],
  opening_hours JSONB,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GIST index for distance queries (requires earthdistance extension)
CREATE INDEX IF NOT EXISTS idx_shops_geo ON public.shops USING GIST (ll_to_earth(lat, lon));
CREATE INDEX IF NOT EXISTS idx_shops_created_by ON public.shops(created_by);

-- Alternative: simple B-tree index if extensions fail
-- CREATE INDEX IF NOT EXISTS idx_shops_lat_lon ON public.shops(lat, lon);

-- Enable RLS and configure policies
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- 1. Public read access for all shops
CREATE POLICY "Allow public read access" ON public.shops
  FOR SELECT USING (true);

-- 2. Authenticated users can insert new shops
CREATE POLICY "Allow authenticated users to insert shops" ON public.shops
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 3. Users can update shops they created
CREATE POLICY "Allow users to update own shops" ON public.shops
  FOR UPDATE USING (auth.uid() = created_by);

-- 4. Users can delete shops they created
CREATE POLICY "Allow users to delete own shops" ON public.shops
  FOR DELETE USING (auth.uid() = created_by);

