-- Fix security issues from the previous migration

-- 1. Fix the is_admin function to have proper search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fix the typo in project_access policy (calls -> claims)
DROP POLICY IF EXISTS "Admins can manage project_access" ON public.project_access;
CREATE POLICY "Admins can manage project_access" ON public.project_access FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));