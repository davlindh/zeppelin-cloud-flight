-- CRITICAL SECURITY FIXES

-- 1. Fix submissions table RLS policy - restrict public read access
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public can read own submissions" ON public.submissions;

-- Create a properly restricted policy that only allows users to see their own submissions
-- using session tracking data for anonymous submissions
CREATE POLICY "Users can read own submissions" 
ON public.submissions 
FOR SELECT 
USING (
  -- Allow admins to see all submissions
  public.is_admin() OR 
  -- Allow users to see submissions with their session ID or device fingerprint
  (session_id IS NOT NULL AND session_id = current_setting('app.session_id', true)) OR
  (device_fingerprint IS NOT NULL AND device_fingerprint = current_setting('app.device_fingerprint', true))
);

-- 2. Restrict admin_settings table - remove public read access
-- Drop the public read policy
DROP POLICY IF EXISTS "Public can read admin_settings" ON public.admin_settings;

-- Create a restricted policy that only allows admins to read settings
CREATE POLICY "Only admins can read admin_settings" 
ON public.admin_settings 
FOR SELECT 
USING (public.is_admin());

-- 3. Add additional security function for session validation
CREATE OR REPLACE FUNCTION public.set_session_context(session_id text, device_fingerprint text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set session context for current transaction
  PERFORM set_config('app.session_id', session_id, true);
  PERFORM set_config('app.device_fingerprint', device_fingerprint, true);
END;
$$;