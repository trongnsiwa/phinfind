-- Visited Shops (Đã ghé) Table and Row Level Security Setup

-- 1. Visited Shops Table
CREATE TABLE IF NOT EXISTS public.visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shop_place_id TEXT NOT NULL,
  shop_name TEXT,
  shop_address TEXT,
  visited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, shop_place_id)
);

-- 2. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON public.visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_shop_place_id ON public.visits(shop_place_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON public.visits(visited_at DESC);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view only their own visits
DROP POLICY IF EXISTS "Users can view own visits" ON public.visits;
CREATE POLICY "Users can view own visits" ON public.visits
  FOR SELECT USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own visits
DROP POLICY IF EXISTS "Users can insert own visits" ON public.visits;
CREATE POLICY "Users can insert own visits" ON public.visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own visits
DROP POLICY IF EXISTS "Users can update own visits" ON public.visits;
CREATE POLICY "Users can update own visits" ON public.visits
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own visits
DROP POLICY IF EXISTS "Users can delete own visits" ON public.visits;
CREATE POLICY "Users can delete own visits" ON public.visits
  FOR DELETE USING (auth.uid() = user_id);
