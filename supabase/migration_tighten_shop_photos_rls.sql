-- Migration: Tighten shop-photos bucket RLS policies
-- Restricts INSERT, UPDATE, and DELETE on storage.objects to the authenticated user's own folders.
-- Permitted folder prefixes: reviews/<user_id>/..., shops/<user_id>/..., avatars/<user_id>/...

-- 1. Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload to shop-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own shop-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own shop-photos" ON storage.objects;

-- 2. Create tightened INSERT policy
CREATE POLICY "Authenticated users can upload to shop-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shop-photos'
  AND (storage.foldername(name))[1] IN ('reviews', 'shops', 'avatars')
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- 3. Create tightened UPDATE policy
CREATE POLICY "Users can update their own shop-photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shop-photos'
  AND (storage.foldername(name))[1] IN ('reviews', 'shops', 'avatars')
  AND (storage.foldername(name))[2] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'shop-photos'
  AND (storage.foldername(name))[1] IN ('reviews', 'shops', 'avatars')
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- 4. Create tightened DELETE policy
CREATE POLICY "Users can delete their own shop-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'shop-photos'
  AND (storage.foldername(name))[1] IN ('reviews', 'shops', 'avatars')
  AND (storage.foldername(name))[2] = (auth.uid())::text
);

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

/*
-- Rollback Migration:
DROP POLICY IF EXISTS "Authenticated users can upload to shop-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own shop-photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own shop-photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload to shop-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shop-photos');

CREATE POLICY "Users can update their own shop-photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'shop-photos');

CREATE POLICY "Users can delete their own shop-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'shop-photos');

NOTIFY pgrst, 'reload schema';
*/
