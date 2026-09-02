-- 1. Create shop-photos bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-photos', 'shop-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Public read policy for shop photos
CREATE POLICY "Public read access for shop-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-photos');

-- 3. Authenticated user upload policy
CREATE POLICY "Authenticated users can upload to shop-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'shop-photos');

-- 4. User update policy
CREATE POLICY "Users can update their own shop-photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'shop-photos');

-- 5. User delete policy
CREATE POLICY "Users can delete their own shop-photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'shop-photos');
