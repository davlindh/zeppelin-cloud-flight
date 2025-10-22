-- Fix RLS policies on orders table to prevent "permission denied for table users" error
-- This migration addresses issues with direct auth.users queries in RLS policies

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Create a safe helper function to get current user's email
-- Using SECURITY DEFINER allows it to access auth.users safely
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- ============================================================================
-- FIX ORDERS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Guests can view orders by email" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Recreate policies with fixes

-- 1. Admin access (no changes needed, has_role() already uses SECURITY DEFINER)
CREATE POLICY "Admins can manage all orders"
ON public.orders
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. Users can view their own orders (by user_id)
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Users can view orders by their email (using safe helper function)
CREATE POLICY "Authenticated users can view orders by email"
ON public.orders
FOR SELECT
TO authenticated
USING (customer_email = public.current_user_email());

-- 4. Allow both anonymous and authenticated users to create orders
-- Anonymous users need this for guest checkout
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================================================
-- FIX ORDER ITEMS TABLE RLS POLICIES
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Recreate policies with fixes

-- 1. Admin access
CREATE POLICY "Admins can manage all order items"
ON public.order_items
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. Users can view their order items (simplified - no subquery accessing auth.users)
CREATE POLICY "Users can view their order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id = auth.uid() 
    OR customer_email = public.current_user_email()
  )
);

-- 3. Allow both anonymous and authenticated users to create order items
CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================================================
-- FIX ORDER STATUS HISTORY RLS POLICIES
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all status history" ON public.order_status_history;
DROP POLICY IF EXISTS "Users can view their order status history" ON public.order_status_history;

-- Recreate policies with fixes

-- 1. Admin access
CREATE POLICY "Admins can view all status history"
ON public.order_status_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2. Users can view their order status history
CREATE POLICY "Users can view their order status history"
ON public.order_status_history
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id = auth.uid()
    OR customer_email = public.current_user_email()
  )
);

-- ============================================================================
-- FIX TRIGGER FUNCTION FOR ORDER STATUS CHANGES
-- ============================================================================

-- Update the trigger function to handle role checking more safely
CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_changed_by_type TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get current user ID safely
    v_user_id := auth.uid();
    
    -- Determine user type safely
    IF v_user_id IS NULL THEN
      v_changed_by_type := 'system';
    ELSE
      -- Check if user is admin (has_role uses SECURITY DEFINER so it's safe)
      BEGIN
        v_is_admin := has_role(v_user_id, 'admin');
        v_changed_by_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'customer' END;
      EXCEPTION WHEN OTHERS THEN
        -- If role check fails, default to customer
        v_changed_by_type := 'customer';
      END;
    END IF;
    
    -- Insert status history record
    INSERT INTO public.order_status_history (
      order_id,
      old_status,
      new_status,
      changed_by,
      changed_by_type
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      v_user_id,
      v_changed_by_type
    );
    
    -- Update timestamp fields based on status
    IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
      NEW.paid_at := now();
    ELSIF NEW.status = 'shipped' THEN
      NEW.shipped_at := now();
    ELSIF NEW.status = 'delivered' THEN
      NEW.delivered_at := now();
    ELSIF NEW.status = 'cancelled' THEN
      NEW.cancelled_at := now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant execute permission on the helper function to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.current_user_email() TO anon, authenticated;

-- Ensure the has_role function is accessible (should already be set, but being explicit)
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
