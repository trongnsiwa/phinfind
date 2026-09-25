-- ==============================================================================
-- Social Follow Graph & Activity Notifications Setup
-- Reference: Tier 3.1 (Follow Graph + Activity Feed) - SOCIAL_FEATURES_ROADMAP.md
--
-- ROLLBACK NOTE:
-- Dropping public.follows removes all social follow relationships and
-- follower/following history irreversibly.
-- ==============================================================================

-- 1. Create Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, followee_id),
  CONSTRAINT check_no_self_follow CHECK (follower_id != followee_id)
);

-- 2. Performance Indexes for Follower/Following queries
CREATE INDEX IF NOT EXISTS idx_follows_followee_created 
  ON public.follows(followee_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_follower_created 
  ON public.follows(follower_id, created_at DESC);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- SELECT: Public can view all follow relationships
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows
  FOR SELECT USING (true);

-- INSERT: Authenticated users can only follow others (no self-follow)
DROP POLICY IF EXISTS "Users can insert own follow" ON public.follows;
CREATE POLICY "Users can insert own follow" ON public.follows
  FOR INSERT WITH CHECK (
    auth.uid() = follower_id AND follower_id != followee_id
  );

-- DELETE: Authenticated users can only unfollow their own follow entries
DROP POLICY IF EXISTS "Users can delete own follow" ON public.follows;
CREATE POLICY "Users can delete own follow" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- 4. Update notifications.type CHECK constraint to support 'new_follower'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_type_check'
  ) THEN
    ALTER TABLE public.notifications DROP CONSTRAINT notifications_type_check;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
      'review_liked',
      'shop_approved',
      'shop_rejected',
      'edit_suggestion_pending',
      'edit_suggestion_approved',
      'edit_suggestion_rejected',
      'new_follower'
    ));
  END IF;
END $$;

-- 5. Trigger Function: notify_new_follower()
CREATE OR REPLACE FUNCTION public.notify_new_follower()
RETURNS TRIGGER AS $$
DECLARE
  follower_full_name TEXT;
  follower_username TEXT;
  follower_avatar TEXT;
  display_name TEXT;
BEGIN
  -- Look up follower profile information
  SELECT full_name, username, avatar_url
  INTO follower_full_name, follower_username, follower_avatar
  FROM public.profiles
  WHERE id = NEW.follower_id;

  display_name := COALESCE(
    NULLIF(TRIM(follower_full_name), ''),
    NULLIF(TRIM(follower_username), ''),
    'Một người dùng'
  );

  INSERT INTO public.notifications (
    user_id,
    type,
    actor_id,
    payload
  ) VALUES (
    NEW.followee_id,
    'new_follower',
    NEW.follower_id,
    jsonb_build_object(
      'actor_name', display_name,
      'actor_username', follower_username,
      'actor_avatar', follower_avatar
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Bind Trigger to public.follows
DROP TRIGGER IF EXISTS trg_notify_new_follower ON public.follows;
CREATE TRIGGER trg_notify_new_follower
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_new_follower();

-- 7. Ensure visits are readable by followees/public for activity feed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'visits' AND policyname = 'Visits are viewable by everyone'
  ) THEN
    -- Fallback policy so activity feed can display friend check-in events
    CREATE POLICY "Visits are viewable by everyone" ON public.visits
      FOR SELECT USING (true);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 8. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- ROLLBACK SCRIPT:
--
-- NOTE: Dropping public.follows removes all social follow relationships and
-- follower/following history irreversibly.
--
-- DROP TRIGGER IF EXISTS trg_notify_new_follower ON public.follows;
-- DROP FUNCTION IF EXISTS public.notify_new_follower();
-- DROP TABLE IF EXISTS public.follows CASCADE;
-- NOTIFY pgrst, 'reload schema';
-- ==============================================================================
