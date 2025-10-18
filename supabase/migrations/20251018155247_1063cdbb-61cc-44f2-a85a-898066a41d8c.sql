-- Ensure auction-images bucket allows public read access
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Public read access for auction images" ON storage.objects;

-- Create policy for public read access to auction images
CREATE POLICY "Public read access for auction images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'auction-images');

-- Ensure the bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'auction-images';