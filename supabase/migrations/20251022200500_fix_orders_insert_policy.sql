-- Additional fix for orders RLS INSERT policy
-- This ensures both anonymous and authenticated users can create orders

-- First, drop the existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a very permissive INSERT policy for order creation
-- This allows both anonymous (guest checkout) and authenticated users to create orders
CREATE POLICY "Allow order creation for all users"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Verify the policy was created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orders' 
    AND policyname = 'Allow order creation for all users'
  ) THEN
    RAISE NOTICE 'Policy "Allow order creation for all users" created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create policy';
  END IF;
END $$;
