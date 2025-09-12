-- Create a public function to verify admin emails safely
-- This function uses SECURITY DEFINER to bypass RLS and can be called by anyone
CREATE OR REPLACE FUNCTION public.is_admin_email(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return true/false, no sensitive data exposed
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = email_to_check
  );
END;
$$;