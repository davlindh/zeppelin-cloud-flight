-- Fix Critical Security Issue: Orders Table Exposes Customer PII to Anonymous Users
-- Drop the overly permissive policy that allows anonymous users to read order data

DROP POLICY IF EXISTS "public_can_view_by_order_number" ON public.orders;

-- Note: The existing policies already provide proper access:
-- - "Admins can manage orders" for admin access
-- - "Users can view their own orders" for authenticated user access
-- If guest order lookup is needed in the future, implement it via a secure edge function
-- that verifies the customer email matches the request