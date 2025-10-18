-- Phase 1: Fix admin permissions for participants
CREATE OR REPLACE FUNCTION public.can_edit_participant(_participant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = _participant_id
    AND (
      -- Admins can edit anyone
      has_role(auth.uid(), 'admin'::app_role)
      OR
      -- Match by auth_user_id (profile owner)
      p.auth_user_id = auth.uid()
      OR
      -- Match by email (fallback for non-linked users)
      (p.contact_email IS NOT NULL 
       AND p.contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  )
$$;

-- Phase 2: Add permission check for projects
CREATE OR REPLACE FUNCTION public.can_edit_project(_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only admins can edit projects
  SELECT has_role(auth.uid(), 'admin'::app_role)
$$;

-- Phase 4: Add permission check for sponsors
CREATE OR REPLACE FUNCTION public.can_edit_sponsor(_sponsor_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only admins can edit sponsors
  SELECT has_role(auth.uid(), 'admin'::app_role)
$$;