-- Add storage permissions to role_permissions table
INSERT INTO role_permissions (role, permission_key, enabled)
VALUES
  -- Admin gets all storage permissions
  ('admin', 'storage.upload_media', true),
  ('admin', 'storage.upload_documents', true),
  ('admin', 'storage.upload_participants', true),
  ('admin', 'storage.upload_projects', true),
  ('admin', 'storage.upload_sponsors', true),
  ('admin', 'storage.upload_ui', true),
  ('admin', 'storage.manage', true),
  
  -- Moderator can upload media for event management
  ('moderator', 'storage.upload_media', true),
  
  -- Provider can upload media for products
  ('provider', 'storage.upload_media', true),
  
  -- Participant can upload media and participant images
  ('participant', 'storage.upload_media', true),
  ('participant', 'storage.upload_participants', true)
ON CONFLICT (role, permission_key) DO UPDATE
SET enabled = EXCLUDED.enabled,
    updated_at = now();

-- Create helper function to check storage permission for a bucket
CREATE OR REPLACE FUNCTION public.can_upload_to_bucket(
  _user_id uuid,
  _bucket_name text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if user has any permission that grants access to this bucket
  SELECT EXISTS (
    SELECT 1 
    FROM role_permissions rp
    JOIN user_roles ur ON ur.role = rp.role
    WHERE ur.user_id = _user_id
      AND rp.enabled = true
      AND (
        -- Media files bucket
        (_bucket_name = 'media-files' AND rp.permission_key = 'storage.upload_media') OR
        -- Documents bucket
        (_bucket_name = 'documents' AND rp.permission_key = 'storage.upload_documents') OR
        -- Legacy buckets
        (_bucket_name = 'participant-avatars' AND rp.permission_key = 'storage.upload_participants') OR
        (_bucket_name = 'project-images' AND rp.permission_key = 'storage.upload_projects') OR
        (_bucket_name = 'sponsor-logos' AND rp.permission_key = 'storage.upload_sponsors') OR
        (_bucket_name = 'ui' AND rp.permission_key = 'storage.upload_ui') OR
        -- Admin can manage all storage
        (rp.permission_key = 'storage.manage')
      )
  )
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION public.can_upload_to_bucket IS 'Check if a user has permission to upload to a specific storage bucket based on their role permissions';
