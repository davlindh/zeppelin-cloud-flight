-- Add RLS policies for admins to manage submissions
-- This fixes the issue where admins cannot see submissions in the inbox

-- Allow admins to read all submissions
CREATE POLICY "Admins can read all submissions"
ON public.submissions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update submissions (change status, etc.)
CREATE POLICY "Admins can update submissions"
ON public.submissions
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.submissions
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);