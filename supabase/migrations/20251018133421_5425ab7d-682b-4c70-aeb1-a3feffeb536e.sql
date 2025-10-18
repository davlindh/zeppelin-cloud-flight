-- Fix storage policies for service-images bucket
-- Ensure admins can upload service images

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view service images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update service images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete service images" ON storage.objects;

-- Public SELECT policy for service-images
CREATE POLICY "Public can view service images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-images');

-- Admin INSERT policy for service-images
CREATE POLICY "Admins can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Admin UPDATE policy for service-images
CREATE POLICY "Admins can update service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'service-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Admin DELETE policy for service-images
CREATE POLICY "Admins can delete service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);