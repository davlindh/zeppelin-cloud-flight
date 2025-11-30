-- Create role_permissions table for dynamic permission management
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_key text NOT NULL,
  enabled boolean DEFAULT true,
  constraints jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(role, permission_key)
);

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Admins can manage permissions
CREATE POLICY "Admins can manage role_permissions"
ON public.role_permissions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Users can read permissions for their roles
CREATE POLICY "Users can read their role permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (
  role IN (
    SELECT ur.role FROM user_roles ur WHERE ur.user_id = auth.uid()
  )
);

-- Create has_permission function for RLS policies
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id uuid,
  _permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM role_permissions rp
    JOIN user_roles ur ON ur.role = rp.role
    WHERE ur.user_id = _user_id
      AND rp.permission_key = _permission
      AND rp.enabled = true
  )
$$;

-- Seed default permissions for all roles
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  -- Admin gets everything
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
  
  -- Moderator: Event support + activity oversight
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
  
  -- Provider: Own commerce
  ('provider', 'commerce.view_products', true),
  ('provider', 'commerce.manage_products', true),
  ('provider', 'commerce.view_orders', true),
  ('provider', 'commerce.view_auctions', true),
  ('provider', 'commerce.manage_auctions', true),
  
  -- Participant: Basic project access
  ('participant', 'projects.view', true),
  ('participant', 'projects.view_activity', true),
  ('participant', 'events.view', true)
ON CONFLICT (role, permission_key) DO NOTHING;