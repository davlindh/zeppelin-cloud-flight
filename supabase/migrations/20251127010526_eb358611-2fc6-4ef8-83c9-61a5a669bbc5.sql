-- Create helper function for project membership check to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_project_member(p_user_id uuid, p_project_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM collaboration_project_members
    WHERE project_id = p_project_id AND user_id = p_user_id
  );
$$;

-- Update the policy to use the helper function
DROP POLICY IF EXISTS "Project members can view their projects" ON public.collaboration_projects;

CREATE POLICY "Project members can view their projects"
ON public.collaboration_projects
FOR SELECT
USING (is_project_member(auth.uid(), id));