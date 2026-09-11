-- ==============================================================================
-- Notifications Table, Triggers, Realtime & Row Level Security Setup
-- Reference: FEAT-04 In-App Notifications
--
-- Note on RLS & Inserts:
-- This table is populated asynchronously by PostgreSQL database triggers (such as
-- when a review is liked) and by backend administrator operations (shop approvals).
-- Regular client-side INSERT is intentionally blocked by RLS policies so that
-- notification records cannot be forged by client SDKs.
-- ==============================================================================

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL CONSTRAINT notifications_user_id_fkey REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'review_liked',
    'shop_approved',
    'shop_rejected',
    'edit_suggestion_pending',
    'edit_suggestion_approved',
    'edit_suggestion_rejected'
  )),
  actor_id UUID CONSTRAINT notifications_actor_id_fkey REFERENCES public.profiles(id) ON DELETE SET NULL,
  shop_place_id TEXT,
  review_id UUID CONSTRAINT notifications_review_id_fkey REFERENCES public.reviews(id) ON DELETE CASCADE,
  payload JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Indexes for Query Performance & Unread Counts
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON public.notifications(user_id, read_at) 
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_actor_id 
  ON public.notifications(actor_id);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SELECT: users can only read their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- UPDATE: users can only mark their own notifications as read
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- INSERT: no client insert policy for standard users; admins can insert for admin operations
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Enable Supabase Realtime for Notifications Table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- 5. Trigger Function: notify_review_liked()
CREATE OR REPLACE FUNCTION public.notify_review_liked()
RETURNS TRIGGER AS $$
DECLARE
  target_author_id UUID;
  target_shop_id TEXT;
  actor_name TEXT;
BEGIN
  -- Look up review author and shop
  SELECT user_id, shop_place_id INTO target_author_id, target_shop_id
  FROM public.reviews
  WHERE id = NEW.review_id;

  -- Skip if review author likes their own review or review does not exist
  IF target_author_id IS NULL OR target_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Look up actor name
  SELECT COALESCE(full_name, username, 'Một người dùng') INTO actor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  INSERT INTO public.notifications (
    user_id,
    type,
    actor_id,
    shop_place_id,
    review_id,
    payload
  ) VALUES (
    target_author_id,
    'review_liked',
    NEW.user_id,
    target_shop_id,
    NEW.review_id,
    jsonb_build_object('actor_name', actor_name)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_review_liked ON public.review_likes;
CREATE TRIGGER trg_notify_review_liked
AFTER INSERT ON public.review_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_review_liked();

-- 6. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';

/*
-- ==============================================================================
-- ROLLBACK SCRIPT:
--
DROP TRIGGER IF EXISTS trg_notify_review_liked ON public.review_likes;
DROP FUNCTION IF EXISTS public.notify_review_liked();
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.notifications CASCADE;
NOTIFY pgrst, 'reload schema';
-- ==============================================================================
*/
