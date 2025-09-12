-- Fix device_fingerprint index issue by removing constraint and improving RLS
-- Remove the problematic index on device_fingerprint
DROP INDEX IF EXISTS idx_submissions_device_fingerprint;

-- Create storage bucket for media files if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media-files', 'media-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage to allow public uploads
CREATE POLICY "Allow public uploads to media-files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media-files');

CREATE POLICY "Allow public access to media-files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media-files');