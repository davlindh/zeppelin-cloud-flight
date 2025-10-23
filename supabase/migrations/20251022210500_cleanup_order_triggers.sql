-- Clean up conflicting triggers on orders table
-- This fixes the "trigger functions can only be called as triggers" error

-- Drop all existing triggers on orders table
DROP TRIGGER IF EXISTS trg_generate_order_number ON public.orders;
DROP TRIGGER IF EXISTS handle_new_order_trigger ON public.orders;
DROP TRIGGER IF EXISTS set_user_id_trigger ON public.orders;
DROP TRIGGER IF EXISTS set_order_user_id ON public.orders;

-- Drop old trigger functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_order() CASCADE;
DROP FUNCTION IF EXISTS public.set_user_id_on_order() CASCADE;

-- Keep only the order number generator function and trigger
-- (This was already created by the database administrator)
-- Just ensure the trigger exists
CREATE TRIGGER trg_generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW 
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION public.generate_order_number();

-- Verification
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_generate_order_number' 
    AND tgrelid = 'public.orders'::regclass
  ) THEN
    RAISE NOTICE 'Trigger trg_generate_order_number verified on orders table';
  ELSE
    RAISE WARNING 'Trigger trg_generate_order_number not found!';
  END IF;
END $$;
