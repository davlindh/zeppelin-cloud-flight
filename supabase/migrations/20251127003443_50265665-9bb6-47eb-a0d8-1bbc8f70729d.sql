-- Migration: Fix Checkout Process & RLS Infinite Recursion
-- Purpose: Fix order creation triggers, inventory reduction, and collaboration_project_members RLS

-- ============================================================================
-- PART 1: Fix Order Number Generation
-- ============================================================================

-- Drop the problematic duplicate trigger
DROP TRIGGER IF EXISTS trg_auto_generate_order_number ON public.orders;

-- Fix the auto_generate_order_number function to generate inline
CREATE OR REPLACE FUNCTION public.auto_generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Generate order number directly if not provided
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || 
                        to_char(now(), 'YYYYMMDD') || '-' || 
                        substring(replace(gen_random_uuid()::text, '-', '') for 8);
  END IF;
  RETURN NEW;
END;
$$;

-- Keep only the working trigger
DROP TRIGGER IF EXISTS trg_generate_order_number ON public.orders;

CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_order_number();

-- ============================================================================
-- PART 2: Fix Inventory Reduction Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reduce_inventory_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  item RECORD;
  v_event_id UUID;
  v_product_type TEXT;
  v_user_id UUID;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'paid' THEN
    -- Get user_id from the order (FIXED: was customer_user_id, now user_id)
    v_user_id := NEW.user_id;
    
    FOR item IN 
      SELECT item_id, item_type, quantity, variant_id
      FROM public.order_items
      WHERE order_id = NEW.id
    LOOP
      IF item.item_type = 'product' THEN
        -- Reduce inventory
        IF item.variant_id IS NOT NULL THEN
          UPDATE public.product_variants
          SET stock_quantity = stock_quantity - item.quantity
          WHERE id = item.variant_id;
        ELSE
          UPDATE public.products
          SET stock_quantity = stock_quantity - item.quantity
          WHERE id = item.item_id;
        END IF;
        
        -- Check if this is an event ticket and create registration
        SELECT event_id, product_type 
        INTO v_event_id, v_product_type
        FROM public.products
        WHERE id = item.item_id;
        
        IF v_product_type = 'event_ticket' AND v_event_id IS NOT NULL AND v_user_id IS NOT NULL THEN
          INSERT INTO public.event_registrations (
            event_id,
            user_id,
            status,
            note,
            approved_at,
            created_at
          )
          SELECT 
            v_event_id,
            v_user_id,
            'confirmed',
            'Auto-registered via ticket purchase (Order: ' || NEW.order_number || ')',
            NOW(),
            NOW()
          WHERE NOT EXISTS (
            SELECT 1 FROM public.event_registrations
            WHERE event_id = v_event_id 
            AND user_id = v_user_id
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- ============================================================================
-- PART 3: Fix RLS Infinite Recursion
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_collaboration_member(p_user_id uuid, p_project_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM collaboration_project_members
    WHERE project_id = p_project_id 
    AND user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_collaboration_admin(p_user_id uuid, p_project_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM collaboration_project_members
    WHERE project_id = p_project_id 
    AND user_id = p_user_id
    AND role IN ('owner', 'admin')
  );
$$;

DROP POLICY IF EXISTS "Members can view project members" ON collaboration_project_members;
DROP POLICY IF EXISTS "Project owners/admins can manage members" ON collaboration_project_members;

CREATE POLICY "Members can view project members"
  ON collaboration_project_members
  FOR SELECT
  USING (
    public.is_collaboration_member(auth.uid(), project_id)
  );

CREATE POLICY "Project owners/admins can manage members"
  ON collaboration_project_members
  FOR ALL
  USING (
    public.is_collaboration_admin(auth.uid(), project_id)
  );