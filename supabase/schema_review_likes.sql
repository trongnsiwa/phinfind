-- Review Likes (Helpful Votes) Table and Row Level Security Setup

-- 1. Create Review Likes Table
CREATE TABLE IF NOT EXISTS public.review_likes (
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (review_id, user_id)
);

-- 2. Index for Fast Aggregation and Counts
CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON public.review_likes(review_id);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

-- Public can read all likes to compute like counts and statuses
DROP POLICY IF EXISTS "Review likes are viewable by everyone" ON public.review_likes;
CREATE POLICY "Review likes are viewable by everyone" ON public.review_likes
  FOR SELECT USING (true);

-- Authenticated users can like reviews, but cannot like their own review
DROP POLICY IF EXISTS "Authenticated users can like reviews except their own" ON public.review_likes;
CREATE POLICY "Authenticated users can like reviews except their own" ON public.review_likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.reviews r
      WHERE r.id = review_id AND r.user_id = auth.uid()
    )
  );

-- Authenticated users can delete (unlike) only their own likes
DROP POLICY IF EXISTS "Authenticated users can delete own likes" ON public.review_likes;
CREATE POLICY "Authenticated users can delete own likes" ON public.review_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';

/*
-- Rollback SQL:
DROP TABLE IF EXISTS public.review_likes CASCADE;
NOTIFY pgrst, 'reload schema';
*/
