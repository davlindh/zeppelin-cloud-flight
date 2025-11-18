-- ============================================================================
-- Phase 1: Event Ticketing System Schema Migration
-- Creates dedicated tables for event tickets, replacing products-based system
-- ============================================================================

-- 1. CREATE EVENT_TICKET_TYPES TABLE
-- Replaces products where product_type='event_ticket'
-- This is the source of truth for ticket capacity and pricing
CREATE TABLE IF NOT EXISTS public.event_ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  
  -- Presentation
  name TEXT NOT NULL,
  description TEXT,
  badge TEXT,
  
  -- Commerce
  currency TEXT NOT NULL DEFAULT 'SEK',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) CHECK (original_price IS NULL OR original_price >= price),
  
  -- Capacity (source of truth!)
  capacity INTEGER NOT NULL CHECK (capacity >= 0),
  per_user_limit INTEGER CHECK (per_user_limit IS NULL OR per_user_limit > 0),
  
  -- Sales window
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  
  -- Operational flags
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  is_visible_public BOOLEAN NOT NULL DEFAULT true,
  
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_event_ticket_name UNIQUE (event_id, name),
  CONSTRAINT valid_sales_window CHECK (sales_start IS NULL OR sales_end IS NULL OR sales_end > sales_start)
);

CREATE INDEX idx_event_ticket_types_event ON public.event_ticket_types(event_id);
CREATE INDEX idx_event_ticket_types_active ON public.event_ticket_types(is_active) WHERE is_active = true;
CREATE INDEX idx_event_ticket_types_sort ON public.event_ticket_types(event_id, sort_order);

CREATE TRIGGER update_event_ticket_types_updated_at
  BEFORE UPDATE ON public.event_ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. CREATE EVENT_TICKET_ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.event_ticket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.event_ticket_types(id) ON DELETE RESTRICT,
  
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  order_id UUID,
  registration_id UUID,
  
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  currency TEXT NOT NULL DEFAULT 'SEK',
  
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_orders_event ON public.event_ticket_orders(event_id);
CREATE INDEX idx_ticket_orders_ticket_type ON public.event_ticket_orders(ticket_type_id);
CREATE INDEX idx_ticket_orders_user ON public.event_ticket_orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_ticket_orders_status ON public.event_ticket_orders(status);
CREATE INDEX idx_ticket_orders_order ON public.event_ticket_orders(order_id) WHERE order_id IS NOT NULL;

CREATE TRIGGER update_event_ticket_orders_updated_at
  BEFORE UPDATE ON public.event_ticket_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. CREATE EVENT_TICKET_INSTANCES TABLE
CREATE TABLE IF NOT EXISTS public.event_ticket_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_order_id UUID NOT NULL REFERENCES public.event_ticket_orders(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.event_ticket_types(id) ON DELETE RESTRICT,
  
  holder_name TEXT,
  holder_email TEXT,
  
  qr_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'valid' 
    CHECK (status IN ('valid', 'checked_in', 'void')),
  
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_instances_order ON public.event_ticket_instances(ticket_order_id);
CREATE INDEX idx_ticket_instances_event ON public.event_ticket_instances(event_id);
CREATE INDEX idx_ticket_instances_ticket_type ON public.event_ticket_instances(ticket_type_id);
CREATE INDEX idx_ticket_instances_qr ON public.event_ticket_instances(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX idx_ticket_instances_status ON public.event_ticket_instances(status);

-- 4. CREATE AVAILABILITY VIEW (fixes stock bug)
CREATE OR REPLACE VIEW public.event_ticket_availability AS
SELECT
  t.id AS ticket_type_id,
  t.event_id,
  t.name,
  t.description,
  t.badge,
  t.price,
  t.original_price,
  t.currency,
  t.capacity,
  t.per_user_limit,
  t.sales_start,
  t.sales_end,
  t.is_active,
  t.is_visible_public,
  t.requires_approval,
  t.sort_order,
  t.metadata,
  t.created_at,
  t.updated_at,
  COALESCE(SUM(o.quantity) FILTER (WHERE o.status = 'confirmed'), 0)::INTEGER AS sold,
  (t.capacity - COALESCE(SUM(o.quantity) FILTER (WHERE o.status = 'confirmed'), 0))::INTEGER AS remaining,
  COALESCE(SUM(o.quantity) FILTER (WHERE o.status = 'pending'), 0)::INTEGER AS pending_orders
FROM public.event_ticket_types t
LEFT JOIN public.event_ticket_orders o ON o.ticket_type_id = t.id
GROUP BY t.id;

-- 5. ENABLE RLS
ALTER TABLE public.event_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ticket_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ticket_instances ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR EVENT_TICKET_TYPES
CREATE POLICY "Admins can manage all ticket types"
  ON public.event_ticket_types FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active public ticket types"
  ON public.event_ticket_types FOR SELECT
  USING (is_active = true AND is_visible_public = true);

CREATE POLICY "Authenticated users can view active ticket types"
  ON public.event_ticket_types FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- 7. RLS POLICIES FOR EVENT_TICKET_ORDERS
CREATE POLICY "Admins can manage all ticket orders"
  ON public.event_ticket_orders FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own ticket orders"
  ON public.event_ticket_orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create ticket orders"
  ON public.event_ticket_orders FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can update ticket orders"
  ON public.event_ticket_orders FOR UPDATE
  USING (true) WITH CHECK (true);

-- 8. RLS POLICIES FOR EVENT_TICKET_INSTANCES
CREATE POLICY "Admins can manage all ticket instances"
  ON public.event_ticket_instances FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their ticket instances"
  ON public.event_ticket_instances FOR SELECT
  USING (
    ticket_order_id IN (
      SELECT id FROM public.event_ticket_orders WHERE user_id = auth.uid()
    )
  );

-- 9. MIGRATE EXISTING DATA
INSERT INTO public.event_ticket_types (
  id, event_id, name, description, price, original_price, 
  capacity, is_active, is_visible_public, sort_order, created_at, updated_at
)
SELECT
  p.id,
  p.event_id,
  p.title,
  p.description,
  p.selling_price,
  NULLIF(p.original_price, p.selling_price),
  GREATEST(COALESCE(p.stock_quantity, 0), 0),
  p.in_stock,
  true,
  0,
  p.created_at,
  p.updated_at
FROM public.products p
WHERE p.product_type = 'event_ticket'
  AND p.event_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.event_ticket_types ett WHERE ett.id = p.id);

INSERT INTO public.event_ticket_orders (
  id, event_id, ticket_type_id, user_id, order_id,
  quantity, unit_price, currency, status, created_at, updated_at
)
SELECT
  oi.id,
  p.event_id,
  oi.item_id,
  o.user_id,
  oi.order_id,
  oi.quantity,
  oi.unit_price,
  'SEK',
  CASE 
    WHEN o.status = 'paid' THEN 'confirmed'
    WHEN o.status IN ('cancelled', 'refunded') THEN 'cancelled'
    ELSE 'pending'
  END,
  oi.created_at,
  o.updated_at
FROM public.order_items oi
JOIN public.orders o ON oi.order_id = o.id
JOIN public.products p ON oi.item_id = p.id
WHERE p.product_type = 'event_ticket'
  AND p.event_id IS NOT NULL
  AND oi.item_type = 'product'
  AND NOT EXISTS (SELECT 1 FROM public.event_ticket_orders eto WHERE eto.id = oi.id);

-- 10. DOCUMENTATION
COMMENT ON TABLE public.event_ticket_types IS 'Event ticket types - source of truth for capacity';
COMMENT ON TABLE public.event_ticket_orders IS 'Ticket purchases linked to orders';
COMMENT ON TABLE public.event_ticket_instances IS 'Individual tickets for QR check-in';
COMMENT ON VIEW public.event_ticket_availability IS 'Real-time availability - prevents stock bugs';
COMMENT ON COLUMN public.event_ticket_types.capacity IS 'Total tickets - source of truth';