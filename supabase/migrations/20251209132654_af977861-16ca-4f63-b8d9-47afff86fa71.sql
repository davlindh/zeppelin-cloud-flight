-- Fix Critical Security Issue: Users Table Data Exposure
-- Drop the overly permissive policy that allows any authenticated user to read all profiles
-- The existing policies are sufficient:
--   "Users can read own profile" (auth_user_id = auth.uid())
--   "Admins can manage all users" (has_role('admin'))

DROP POLICY IF EXISTS "Authenticated users can read users" ON public.users;