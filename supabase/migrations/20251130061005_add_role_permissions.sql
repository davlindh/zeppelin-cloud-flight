-- Create role_permissions table for granular permission system
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role APP_ROLE NOT NULL,
  permission_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  constraints JSONB, -- Optional constraints for the permission
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure unique combination of role + permission
  UNIQUE(role, permission_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON role_permissions(permission_key);
CREATE INDEX IF NOT EXISTS idx_role_permissions_enabled ON role_permissions(enabled);

-- Row Level Security
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can modify role permissions
CREATE POLICY "Admins can manage role permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_role_permissions_updated_at
  BEFORE UPDATE ON role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_role_permissions_updated_at();

-- Insert default permissions for each role
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
-- Admin permissions (all permissions enabled by default)
('admin', 'users.view', true),
('admin', 'users.manage', true),
('admin', 'users.view_activity', true),
('admin', 'events.view', true),
('admin', 'events.manage', true),
('admin', 'events.view_registrations', true),
('admin', 'events.manage_registrations', true),
('admin', 'events.check_in', true),
('admin', 'projects.view', true),
('admin', 'projects.manage', true),
('admin', 'projects.view_activity', true),
('admin', 'content.view_submissions', true),
('admin', 'content.manage_submissions', true),
('admin', 'content.view_media', true),
('admin', 'content.manage_media', true),
('admin', 'content.view_participants', true),
('admin', 'content.manage_participants', true),
('admin', 'commerce.view_products', true),
('admin', 'commerce.manage_products', true),
('admin', 'commerce.view_orders', true),
('admin', 'commerce.manage_orders', true),
('admin', 'commerce.view_auctions', true),
('admin', 'commerce.manage_auctions', true),
('admin', 'analytics.view', true),
('admin', 'analytics.view_activity', true),
('admin', 'system.manage_roles', true),
('admin', 'system.manage_permissions', true),
('admin', 'system.view_security', true),
('admin', 'system.manage_settings', true),

-- Moderator permissions
('moderator', 'users.view', true),
('moderator', 'users.view_activity', true),
('moderator', 'events.view', true),
('moderator', 'events.view_registrations', true),
('moderator', 'events.manage_registrations', true),
('moderator', 'events.check_in', true),
('moderator', 'projects.view', true),
('moderator', 'projects.view_activity', true),
('moderator', 'content.view_submissions', true),
('moderator', 'content.view_media', true),
('moderator', 'content.view_participants', true),
('moderator', 'analytics.view_activity', true),

-- Provider permissions
('provider', 'commerce.view_products', true),
('provider', 'commerce.manage_products', true),
('provider', 'commerce.view_orders', true),
('provider', 'commerce.view_auctions', true),
('provider', 'commerce.manage_auctions', true),

-- Participant permissions
('participant', 'projects.view', true),
('participant', 'projects.view_activity', true),
('participant', 'events.view', true),

-- Customer permissions (none by default - marketplace access only)
-- No permissions for customer role
ON CONFLICT (role, permission_key) DO NOTHING;

-- Create has_permission function for simplified checking
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN := false;
BEGIN
  -- Check if user has the permission through any of their roles
  SELECT EXISTS(
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = $1
    AND rp.permission_key = $2
    AND rp.enabled = true
  ) INTO has_perm;

  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION has_permission(UUID, TEXT) TO authenticated;
