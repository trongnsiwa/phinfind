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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create GIST index for distance queries (requires earthdistance extension)
CREATE INDEX IF NOT EXISTS idx_shops_geo ON public.shops USING GIST (ll_to_earth(lat, lon));

-- Alternative: simple B-tree index if extensions fail
-- CREATE INDEX IF NOT EXISTS idx_shops_lat_lon ON public.shops(lat, lon);

-- Enable RLS and allow public read access
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.shops FOR SELECT USING (true);
