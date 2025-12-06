-- Fix Critical Security Issue: Communication Requests Publicly Readable
-- Drop the overly permissive policy that allows anyone to read all customer communications

DROP POLICY IF EXISTS "Public can read communication_requests" ON public.communication_requests;

-- Create policy for customers to view their own requests (by matching email)
CREATE POLICY "Customers view own requests"
ON public.communication_requests FOR SELECT
TO authenticated
USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create policy for providers to view requests sent to them
CREATE POLICY "Providers view their requests"
ON public.communication_requests FOR SELECT
TO authenticated
USING (
  provider_id IN (
    SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
  )
);