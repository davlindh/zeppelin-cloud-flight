-- Drop and recreate the reduce_inventory_on_order function with event registration logic
DROP FUNCTION IF EXISTS public.reduce_inventory_on_order() CASCADE;

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
    -- Get user_id from the order
    v_user_id := NEW.customer_user_id;
    
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
          -- Only create registration if one doesn't already exist for this user+event
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS reduce_inventory_trigger ON public.orders;
CREATE TRIGGER reduce_inventory_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.reduce_inventory_on_order();