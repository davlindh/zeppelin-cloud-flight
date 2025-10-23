-- Add ownership fields to projects table (similar to participants)
-- This enables user-project relationships and claiming functionality

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS match_confidence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS match_criteria JSONB;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_contact_email ON projects(contact_email);
CREATE INDEX IF NOT EXISTS idx_projects_auth_user_id ON projects(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_claimed_at ON projects(claimed_at);

-- Add RLS policies for project ownership
CREATE POLICY "Users can view their own projects" ON projects
FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON projects
FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON projects
FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- Update existing projects to have contact_email from submissions if available
-- This is a one-time migration to populate contact_email for existing projects
UPDATE projects
SET contact_email = (
  SELECT s.contact_email
  FROM submissions s
  WHERE s.type = 'project'
    AND s.title = projects.title
    AND s.status = 'approved'
  LIMIT 1
)
WHERE contact_email IS NULL;

-- Create function to claim project ownership
CREATE OR REPLACE FUNCTION claim_project_profile(
  _project_id UUID,
  _user_id UUID,
  _user_email TEXT
)
RETURNS JSONB AS $$
DECLARE
  project_record RECORD;
  result JSONB;
BEGIN
  -- Get project details
  SELECT * INTO project_record
  FROM projects
  WHERE id = _project_id;

  -- Check if project exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Projekt hittades inte'
    );
  END IF;

  -- Check if already claimed
  IF project_record.auth_user_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Projektet är redan länkad till en användare'
    );
  END IF;

  -- Check if email matches (if project has contact_email)
  IF project_record.contact_email IS NOT NULL
     AND project_record.contact_email != _user_email THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'E-postadressen matchar inte projektets kontaktinformation'
    );
  END IF;

  -- Claim the project
  UPDATE projects
  SET
    auth_user_id = _user_id,
    claimed_at = NOW(),
    match_confidence = 100,
    match_criteria = jsonb_build_object('email', true, 'claimed', true)
  WHERE id = _project_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Projektet har länkats till din profil'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION claim_project_profile(UUID, UUID, TEXT) TO authenticated;

-- Create RPC function for checking project edit permissions
CREATE OR REPLACE FUNCTION can_edit_project(_project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  project_owner UUID;
  user_role TEXT;
BEGIN
  -- Get current user role
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  -- Admins can edit all projects
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;

  -- Get project owner
  SELECT auth_user_id INTO project_owner
  FROM projects
  WHERE id = _project_id;

  -- Users can edit their own projects
  RETURN project_owner = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_edit_project(UUID) TO authenticated;
