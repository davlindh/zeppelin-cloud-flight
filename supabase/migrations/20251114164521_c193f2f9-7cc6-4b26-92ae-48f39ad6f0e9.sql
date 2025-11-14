-- Add provider audit log table
CREATE TABLE IF NOT EXISTS provider_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_provider_audit_log_provider_id ON provider_audit_log(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_audit_log_created_at ON provider_audit_log(created_at);

-- Enable RLS
ALTER TABLE provider_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view provider audit log"
ON provider_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert provider audit log"
ON provider_audit_log
FOR INSERT
WITH CHECK (true);