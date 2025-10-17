-- Phase 6A & 6B: Database indexes, optimizations and stats function for Zeppel Admin

-- Add indexes for media_library performance
CREATE INDEX IF NOT EXISTS idx_media_library_status ON media_library(status);
CREATE INDEX IF NOT EXISTS idx_media_library_type ON media_library(type);
CREATE INDEX IF NOT EXISTS idx_media_library_source ON media_library(source);
CREATE INDEX IF NOT EXISTS idx_media_library_project_id ON media_library(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_library_participant_id ON media_library(participant_id) WHERE participant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_library_submission_id ON media_library(submission_id) WHERE submission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at DESC);

-- Add full-text search column for media
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_media_library_search ON media_library USING GIN(search_vector);

-- Trigger for auto-update of search_vector
CREATE OR REPLACE FUNCTION update_media_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.filename, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER media_library_search_update
BEFORE INSERT OR UPDATE ON media_library
FOR EACH ROW EXECUTE FUNCTION update_media_search_vector();

-- Update existing rows with search_vector
UPDATE media_library 
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(filename, '')), 'C')
WHERE search_vector IS NULL;

-- Add indexes for submissions performance
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- Stats function for Zeppel Admin Dashboard
CREATE OR REPLACE FUNCTION get_zeppel_admin_stats()
RETURNS JSON 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'submissions', json_build_object(
      'total', (SELECT COUNT(*) FROM submissions),
      'pending', (SELECT COUNT(*) FROM submissions WHERE status = 'pending'),
      'approved', (SELECT COUNT(*) FROM submissions WHERE status = 'approved'),
      'rejected', (SELECT COUNT(*) FROM submissions WHERE status = 'rejected')
    ),
    'participants', json_build_object(
      'total', (SELECT COUNT(*) FROM participants),
      'with_profiles', (SELECT COUNT(*) FROM participants WHERE profile_completed = true),
      'public', (SELECT COUNT(*) FROM participants WHERE is_public = true)
    ),
    'projects', json_build_object(
      'total', (SELECT COUNT(*) FROM projects)
    ),
    'media', json_build_object(
      'total', (SELECT COUNT(*) FROM media_library),
      'pending', (SELECT COUNT(*) FROM media_library WHERE status = 'pending'),
      'approved', (SELECT COUNT(*) FROM media_library WHERE status = 'approved'),
      'rejected', (SELECT COUNT(*) FROM media_library WHERE status = 'rejected')
    ),
    'sponsors', json_build_object(
      'total', (SELECT COUNT(*) FROM sponsors)
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create media audit log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS media_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES media_library(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for media audit log
CREATE INDEX IF NOT EXISTS idx_media_audit_log_media_id ON media_audit_log(media_id);
CREATE INDEX IF NOT EXISTS idx_media_audit_log_created_at ON media_audit_log(created_at DESC);

-- RLS for media audit log
ALTER TABLE media_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
ON media_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit log"
ON media_audit_log
FOR INSERT
WITH CHECK (true);