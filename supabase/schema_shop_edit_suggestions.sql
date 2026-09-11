-- ==============================================================================
-- Migration: Shop Edit Suggestions with Admin Moderation
-- Reference: FEAT-08 Community Edit Suggestions
-- Date: 2026-09-11
-- ==============================================================================

-- 1. Table: shop_edit_suggestions
CREATE TABLE IF NOT EXISTS public.shop_edit_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_place_id TEXT NOT NULL REFERENCES public.shops(place_id) ON DELETE CASCADE,
  suggested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  changes JSONB NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Guardrail: Reject changes containing disallowed keys (place_id, created_by, verified, rating, total_ratings, hidden, created_at, updated_at)
  CONSTRAINT chk_disallowed_keys CHECK (
    jsonb_typeof(changes) = 'object' AND
    NOT (changes ?| ARRAY['place_id', 'created_by', 'verified', 'rating', 'total_ratings', 'hidden', 'created_at', 'updated_at'])
  )
);

-- Note: reviewed_by strictly references public.profiles(id) on public.shop_edit_suggestions.
-- To preserve PostgREST relationship embedding on public.reviews, no foreign key pointing
-- to public.profiles was added to public.reviews (REVIEWS-FK-AMBIGUITY guardrail).

-- 2. Indexes for Performance & Constraints
CREATE INDEX IF NOT EXISTS idx_shop_edit_suggestions_status 
  ON public.shop_edit_suggestions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shop_edit_suggestions_shop 
  ON public.shop_edit_suggestions(shop_place_id, status);

CREATE INDEX IF NOT EXISTS idx_shop_edit_suggestions_user 
  ON public.shop_edit_suggestions(suggested_by, created_at DESC);

-- Partial unique index: Enforce one pending suggestion per shop per user
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_suggestion_per_user_per_shop 
  ON public.shop_edit_suggestions(shop_place_id, suggested_by) 
  WHERE status = 'pending';

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.shop_edit_suggestions ENABLE ROW LEVEL SECURITY;

-- INSERT: Authenticated users can insert suggestions with suggested_by = auth.uid()
DROP POLICY IF EXISTS "Users can insert own suggestions" ON public.shop_edit_suggestions;
CREATE POLICY "Users can insert own suggestions" ON public.shop_edit_suggestions
  FOR INSERT WITH CHECK (auth.uid() = suggested_by);

-- SELECT: Authenticated users can view their own suggestions
DROP POLICY IF EXISTS "Users can view own suggestions" ON public.shop_edit_suggestions;
CREATE POLICY "Users can view own suggestions" ON public.shop_edit_suggestions
  FOR SELECT USING (auth.uid() = suggested_by);

-- SELECT: Admins can view all suggestions
DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.shop_edit_suggestions;
CREATE POLICY "Admins can view all suggestions" ON public.shop_edit_suggestions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- UPDATE: Admins can update status, reviewed_by, reviewed_at, review_note
DROP POLICY IF EXISTS "Admins can update suggestions" ON public.shop_edit_suggestions;
CREATE POLICY "Admins can update suggestions" ON public.shop_edit_suggestions
  FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Notice: Standard users have NO UPDATE or DELETE policies, preventing modifications or cancellations after submission.

-- 4. Trigger Function: Notify shop owner when a new suggestion is submitted
CREATE OR REPLACE FUNCTION public.notify_shop_edit_suggestion_pending()
RETURNS TRIGGER AS $$
DECLARE
  target_owner_id UUID;
  target_shop_name TEXT;
  actor_name TEXT;
BEGIN
  -- Look up shop creator and name
  SELECT created_by, name INTO target_owner_id, target_shop_name
  FROM public.shops
  WHERE place_id = NEW.shop_place_id;

  -- Silently no-op if created_by is null or if creator suggested the edit
  IF target_owner_id IS NULL OR target_owner_id = NEW.suggested_by THEN
    RETURN NEW;
  END IF;

  -- Look up actor name
  SELECT COALESCE(full_name, username, 'Một người dùng') INTO actor_name
  FROM public.profiles
  WHERE id = NEW.suggested_by;

  INSERT INTO public.notifications (
    user_id,
    type,
    actor_id,
    shop_place_id,
    payload
  ) VALUES (
    target_owner_id,
    'edit_suggestion_pending',
    NEW.suggested_by,
    NEW.shop_place_id,
    jsonb_build_object(
      'shop_name', target_shop_name,
      'actor_name', actor_name,
      'suggestion_id', NEW.id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_shop_edit_suggestion_pending ON public.shop_edit_suggestions;
CREATE TRIGGER trg_notify_shop_edit_suggestion_pending
AFTER INSERT ON public.shop_edit_suggestions
FOR EACH ROW EXECUTE FUNCTION public.notify_shop_edit_suggestion_pending();

-- 5. Trigger Function: Notify suggester when admin reviews suggestion
CREATE OR REPLACE FUNCTION public.notify_shop_edit_suggestion_reviewed()
RETURNS TRIGGER AS $$
DECLARE
  target_shop_name TEXT;
  notif_type TEXT;
  notif_payload JSONB;
BEGIN
  -- Fire only when transitioning from pending to approved or rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    SELECT name INTO target_shop_name
    FROM public.shops
    WHERE place_id = NEW.shop_place_id;

    IF NEW.status = 'approved' THEN
      notif_type := 'edit_suggestion_approved';
      notif_payload := jsonb_build_object(
        'shop_name', target_shop_name,
        'suggestion_id', NEW.id
      );
    ELSE
      notif_type := 'edit_suggestion_rejected';
      notif_payload := jsonb_build_object(
        'shop_name', target_shop_name,
        'suggestion_id', NEW.id,
        'review_note', NEW.review_note
      );
    END IF;

    INSERT INTO public.notifications (
      user_id,
      type,
      actor_id,
      shop_place_id,
      payload
    ) VALUES (
      NEW.suggested_by,
      notif_type,
      NEW.reviewed_by,
      NEW.shop_place_id,
      notif_payload
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_shop_edit_suggestion_reviewed ON public.shop_edit_suggestions;
CREATE TRIGGER trg_notify_shop_edit_suggestion_reviewed
AFTER UPDATE ON public.shop_edit_suggestions
FOR EACH ROW EXECUTE FUNCTION public.notify_shop_edit_suggestion_reviewed();

-- 6. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';

/*
-- ==============================================================================
-- ROLLBACK SCRIPT:
--
DROP TRIGGER IF EXISTS trg_notify_shop_edit_suggestion_reviewed ON public.shop_edit_suggestions;
DROP FUNCTION IF EXISTS public.notify_shop_edit_suggestion_reviewed();
DROP TRIGGER IF EXISTS trg_notify_shop_edit_suggestion_pending ON public.shop_edit_suggestions;
DROP FUNCTION IF EXISTS public.notify_shop_edit_suggestion_pending();
DROP POLICY IF EXISTS "Admins can update suggestions" ON public.shop_edit_suggestions;
DROP POLICY IF EXISTS "Admins can view all suggestions" ON public.shop_edit_suggestions;
DROP POLICY IF EXISTS "Users can view own suggestions" ON public.shop_edit_suggestions;
DROP POLICY IF EXISTS "Users can insert own suggestions" ON public.shop_edit_suggestions;
DROP INDEX IF EXISTS uniq_pending_suggestion_per_user_per_shop;
DROP INDEX IF EXISTS idx_shop_edit_suggestions_user;
DROP INDEX IF EXISTS idx_shop_edit_suggestions_shop;
DROP INDEX IF EXISTS idx_shop_edit_suggestions_status;
DROP TABLE IF EXISTS public.shop_edit_suggestions CASCADE;
NOTIFY pgrst, 'reload schema';
-- ==============================================================================
*/
