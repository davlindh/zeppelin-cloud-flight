-- Create role_applications table
CREATE TABLE role_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_role app_role NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  application_data jsonb DEFAULT '{}',
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

-- Create unique constraint to prevent duplicate pending applications
CREATE UNIQUE INDEX unique_pending_application 
ON role_applications (user_id, requested_role) 
WHERE status = 'pending';

-- Create index for performance
CREATE INDEX idx_role_applications_user ON role_applications(user_id);
CREATE INDEX idx_role_applications_status ON role_applications(status);

-- Enable RLS
ALTER TABLE role_applications ENABLE ROW LEVEL SECURITY;

-- Users can view own applications
CREATE POLICY "Users can view own applications"
ON role_applications FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Users can create own applications
CREATE POLICY "Users can create own applications"
ON role_applications FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON role_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
ON role_applications FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger to update updated_at
CREATE TRIGGER update_role_applications_updated_at
BEFORE UPDATE ON role_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();