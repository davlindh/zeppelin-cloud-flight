-- Add password support for admin users and improve submissions tracking

-- Add session tracking columns to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS ip_address INET;

-- Create index for session tracking
CREATE INDEX IF NOT EXISTS idx_submissions_session_id ON public.submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_device_fingerprint ON public.submissions(device_fingerprint);

-- Update admin_users to support password authentication
-- We'll keep the email whitelist but admins will use proper Supabase auth
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique index on auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);

-- Update the is_admin function to check both email and auth user
CREATE OR REPLACE FUNCTION public.is_admin(user_email text DEFAULT NULL, user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check by authenticated user ID first
  IF user_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = user_id
    );
  END IF;
  
  -- Fallback to email check for backwards compatibility
  IF user_email IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = user_email
    );
  END IF;
  
  -- Check current authenticated user
  IF auth.uid() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE auth_user_id = auth.uid()
    );
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create function to generate session ID for anonymous users
CREATE OR REPLACE FUNCTION public.generate_session_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'sess_' || encode(gen_random_bytes(16), 'hex');
END;
$$;

-- Create function to get device fingerprint hash
CREATE OR REPLACE FUNCTION public.hash_device_fingerprint(fingerprint TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(digest(fingerprint, 'sha256'), 'hex');
END;
$$;