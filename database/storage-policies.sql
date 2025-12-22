-- =====================================================
-- Supabase Storage Policies for pdf-prints bucket
-- =====================================================
-- Run this in Supabase SQL Editor to fix:
-- "new row violates row-level security policy"
-- =====================================================

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-prints', 'pdf-prints', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to pdf-prints"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdf-prints');

-- Policy 2: Allow public read access to files
CREATE POLICY "Allow public read access to pdf-prints"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pdf-prints');

-- Policy 3: Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates to pdf-prints"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pdf-prints')
WITH CHECK (bucket_id = 'pdf-prints');

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes from pdf-prints"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pdf-prints');

-- =====================================================
-- After running this SQL:
-- 1. Refresh your Supabase dashboard
-- 2. Go to Storage > pdf-prints > Policies
-- 3. Verify you see the 4 policies listed above
-- 4. Try uploading a PDF from your app again
-- =====================================================
