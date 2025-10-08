-- Create order status enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Create order item type enum
CREATE TYPE order_item_type AS ENUM (
  'product',
  'auction',
  'service'
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  
  -- Customer information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Pricing
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  
  -- Addresses (JSONB for flexibility)
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Order status
  status order_status NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_intent_id TEXT,
  
  -- Tracking
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Create indexes for orders
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Item reference (polymorphic)
  item_type order_item_type NOT NULL,
  item_id UUID NOT NULL,
  item_title TEXT NOT NULL,
  item_sku TEXT,
  
  -- Variant info (for products)
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  variant_details JSONB,
  
  -- Pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Additional data
  metadata JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for order items
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_item_type_id ON public.order_items(item_type, item_id);

-- Create order status history table
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for order status history
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON public.order_status_history(created_at DESC);

-- Create order number generator function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  order_num TEXT;
BEGIN
  year_part := TO_CHAR(now(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(order_number FROM 'ORD-' || year_part || '-(\d+)') AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM public.orders
  WHERE order_number LIKE 'ORD-' || year_part || '-%';
  
  order_num := 'ORD-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN order_num;
END;
$$;

-- Create auto-generate order number trigger function
CREATE OR REPLACE FUNCTION public.auto_generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating order numbers
CREATE TRIGGER trg_auto_generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_order_number();

-- Create trigger for updating timestamps
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create track order status change function
CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
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
      auth.uid(),
      CASE 
        WHEN auth.uid() IS NULL THEN 'system'
        WHEN has_role(auth.uid(), 'admin') THEN 'admin'
        ELSE 'customer'
      END
    );
    
    -- Update timestamp fields
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

-- Create trigger for tracking status changes
CREATE TRIGGER trg_track_order_status_change
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.track_order_status_change();

-- Create reduce inventory function
CREATE OR REPLACE FUNCTION public.reduce_inventory_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'paid' THEN
    FOR item IN 
      SELECT item_id, item_type, quantity, variant_id
      FROM public.order_items
      WHERE order_id = NEW.id
    LOOP
      IF item.item_type = 'product' THEN
        IF item.variant_id IS NOT NULL THEN
          UPDATE public.product_variants
          SET stock_quantity = stock_quantity - item.quantity
          WHERE id = item.variant_id;
        ELSE
          UPDATE public.products
          SET stock_quantity = stock_quantity - item.quantity
          WHERE id = item.item_id;
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for reducing inventory
CREATE TRIGGER trg_reduce_inventory_on_order
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.reduce_inventory_on_order();

-- Enable RLS on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Admins can manage all orders"
ON public.orders
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Guests can view orders by email"
ON public.orders
FOR SELECT
TO authenticated
USING (customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Order items policies
CREATE POLICY "Admins can manage all order items"
ON public.order_items
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id = auth.uid() 
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Order status history policies
CREATE POLICY "Admins can view all status history"
ON public.order_status_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their order status history"
ON public.order_status_history
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE user_id = auth.uid()
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);