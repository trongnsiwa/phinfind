-- Migration: Backfill usernames for profiles and auto-generate for new users
-- Ensures all users have a unique, URL-safe username satisfying ^[a-zA-Z0-9_]+$ (3-30 chars)

-- 1. Helper function: generate_unique_username
CREATE OR REPLACE FUNCTION public.generate_unique_username(
  email_val TEXT,
  full_name_val TEXT,
  profile_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_raw TEXT;
  v_clean TEXT;
  v_base TEXT;
  v_candidate TEXT;
  v_suffix TEXT;
  i INT;
BEGIN
  -- Extract candidate source: prefer email local-part if present, else full_name, fallback to 'user'
  v_raw := NULLIF(trim(split_part(email_val, '@', 1)), '');
  IF v_raw IS NULL THEN
    v_raw := NULLIF(trim(full_name_val), '');
  END IF;
  IF v_raw IS NULL THEN
    v_raw := 'user';
  END IF;

  -- Lowercase
  v_clean := lower(v_raw);

  -- Transliterate Vietnamese accented characters to ASCII equivalents
  v_clean := translate(
    v_clean,
    'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
  );

  -- Convert whitespace, dots, and hyphens to underscores
  v_clean := regexp_replace(v_clean, '[\s\.\-]+', '_', 'g');

  -- Strip all non-alphanumeric and non-underscore characters
  v_clean := regexp_replace(v_clean, '[^a-z0-9_]', '', 'g');

  -- Collapse duplicate underscores and trim leading/trailing underscores
  v_clean := regexp_replace(v_clean, '_+', '_', 'g');
  v_clean := trim(both '_' from v_clean);

  -- Ensure valid minimum base length
  IF length(v_clean) = 0 THEN
    v_clean := 'user';
  ELSIF length(v_clean) < 3 THEN
    v_clean := substring('user_' || v_clean from 1 for 24);
  END IF;

  -- Truncate base to at most 24 chars to reserve space for uniqueness suffixes within 30 chars
  v_base := substring(v_clean from 1 for 24);
  v_base := rtrim(v_base, '_');
  IF length(v_base) < 3 THEN
    v_base := rpad(v_base, 3, '0');
  END IF;

  -- First check: does the base slug have a collision?
  v_candidate := v_base;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username = v_candidate
      AND (profile_id IS NULL OR id != profile_id)
  ) THEN
    RETURN v_candidate;
  END IF;

  -- Second check: deterministic suffix from row UUID if available
  IF profile_id IS NOT NULL THEN
    v_suffix := substring(replace(profile_id::text, '-', '') from 1 for 5);
    v_candidate := substring(v_base from 1 for 24) || '_' || v_suffix;
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE username = v_candidate
        AND (profile_id IS NULL OR id != profile_id)
    ) THEN
      RETURN v_candidate;
    END IF;
  END IF;

  -- Third check: retry loop appending random hex suffix (5 hex chars: 00000 - fffff)
  FOR i IN 1..50 LOOP
    v_suffix := lpad(to_hex(floor(random() * 1048575)::int), 5, '0');
    v_candidate := substring(v_base from 1 for 24) || '_' || v_suffix;
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE username = v_candidate
        AND (profile_id IS NULL OR id != profile_id)
    ) THEN
      RETURN v_candidate;
    END IF;
  END LOOP;

  -- Fallback in extreme collision case
  RETURN 'user_' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 16);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 2. Update handle_new_user() trigger function to auto-generate username on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_username TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name');
  v_username := public.generate_unique_username(
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.email
    ),
    v_full_name,
    NEW.id
  );

  INSERT INTO public.profiles (id, username, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    v_username,
    v_full_name,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = COALESCE(public.profiles.username, EXCLUDED.username),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill all existing profiles where username IS NULL or empty
DO $$
DECLARE
  r RECORD;
  v_new_username TEXT;
BEGIN
  FOR r IN
    SELECT id, email, full_name
    FROM public.profiles
    WHERE username IS NULL OR trim(username) = ''
  LOOP
    v_new_username := public.generate_unique_username(r.email, r.full_name, r.id);
    UPDATE public.profiles
    SET username = v_new_username,
        updated_at = NOW()
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- 4. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
