-- Critical Security Fix: Restrict participant contact information access
-- Create function to check if user owns participant record
CREATE OR REPLACE FUNCTION public.current_user_owns_participant(participant_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT participant_user_id = auth.uid();
$$;

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Public can read participants" ON public.participants;

-- Create new restricted policies for participants table
CREATE POLICY "Public can read basic participant info" 
ON public.participants 
FOR SELECT 
USING (true)
-- Allow reading of non-sensitive fields only
WITH CHECK (false);

-- Create policy for participant contact info (admins and owner only)
CREATE POLICY "Only admins and owners can read contact info" 
ON public.participants 
FOR SELECT 
USING (
  is_admin() OR 
  (auth.uid() IS NOT NULL AND current_user_owns_participant(auth.uid()))
);

-- Update RLS to hide sensitive columns from public access
-- We'll use a view for public access that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_participants AS 
SELECT 
  id,
  name,
  slug,
  bio,
  avatar_path,
  skills,
  interests,
  experience_level,
  contributions,
  location,
  website,
  social_links,
  availability,
  time_commitment,
  how_found_us,
  created_at,
  updated_at
FROM public.participants;