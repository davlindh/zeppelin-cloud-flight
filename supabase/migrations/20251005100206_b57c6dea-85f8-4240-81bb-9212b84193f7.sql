-- Add thumbnail URLs for optimized media loading
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE project_media ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE participant_media ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add indexes for performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_submissions_type_status ON submissions(type, status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_media_project_type ON project_media(project_id, type);
CREATE INDEX IF NOT EXISTS idx_participant_media_participant ON participant_media(participant_id, category);