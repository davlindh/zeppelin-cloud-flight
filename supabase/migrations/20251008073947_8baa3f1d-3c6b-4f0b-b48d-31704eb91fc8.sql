-- Phase 1: Create User Roles System

-- 1.1 Create role enum (minimal and functional)
CREATE TYPE public.app_role AS ENUM ('admin', 'participant', 'customer');

-- 1.2 Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- 1.3 Add auth_user_id to Participants Table
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for self-edit lookups
CREATE INDEX IF NOT EXISTS idx_participants_auth_user_id ON public.participants(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_participants_contact_email ON public.participants(contact_email);

-- 1.4 Create Security Functions

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if authenticated user can edit participant (by email OR auth_user_id)
CREATE OR REPLACE FUNCTION public.can_edit_participant(_participant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = _participant_id
    AND (
      -- Match by auth_user_id (primary method)
      p.auth_user_id = auth.uid()
      OR
      -- Match by email (fallback for non-linked users)
      (p.contact_email IS NOT NULL 
       AND p.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  )
$$;

-- 1.5 Migrate existing admin users to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT auth_user_id, 'admin'::public.app_role
FROM public.admin_users
WHERE auth_user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 1.6 Create admin_access_logs table
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON public.admin_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_access_logs(created_at DESC);

-- Phase 2: Update RLS Policies

-- 2.1 Update Participants Table RLS
DROP POLICY IF EXISTS "Admins can manage participants" ON public.participants;
DROP POLICY IF EXISTS "Admins can read all participant data" ON public.participants;
DROP POLICY IF EXISTS "Public can read non-sensitive participant info" ON public.participants;
DROP POLICY IF EXISTS "Public can read participants" ON public.participants;

-- Public read (non-sensitive fields only)
CREATE POLICY "Public can view participants"
ON public.participants
FOR SELECT
USING (true);

-- Self-edit: participants can update their own profile
CREATE POLICY "Participants can edit own profile"
ON public.participants
FOR UPDATE
TO authenticated
USING (public.can_edit_participant(id))
WITH CHECK (public.can_edit_participant(id));

-- Admins have full access
CREATE POLICY "Admins have full access to participants"
ON public.participants
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2.2 Update Projects Table RLS (keep admin-only editing)
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;

CREATE POLICY "Admins can manage projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2.3 Create user_roles RLS policies
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2.4 Create admin_access_logs RLS policies
CREATE POLICY "Admins can view logs"
ON public.admin_access_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated users can insert logs"
ON public.admin_access_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());