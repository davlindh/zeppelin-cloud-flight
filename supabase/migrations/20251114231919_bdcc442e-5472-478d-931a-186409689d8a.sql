-- Phase 4A: Extend database schema for multi-seller marketplace

-- Extend products table with seller and event fields
ALTER TABLE products
ADD COLUMN seller_id uuid REFERENCES service_providers(id) ON DELETE SET NULL,
ADD COLUMN seller_type text CHECK (seller_type IN ('participant', 'provider', 'admin')) DEFAULT 'admin',
ADD COLUMN event_id uuid REFERENCES events(id) ON DELETE SET NULL,
ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN visibility text CHECK (visibility IN ('public', 'event_only', 'invite_only', 'hidden')) DEFAULT 'public',
ADD COLUMN approval_status text CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
ADD COLUMN commission_rate numeric(5,2) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- Extend orders table
ALTER TABLE orders
ADD COLUMN event_id uuid REFERENCES events(id) ON DELETE SET NULL,
ADD COLUMN total_commission numeric(10,2) DEFAULT 0 CHECK (total_commission >= 0);

-- Extend order_items table
ALTER TABLE order_items
ADD COLUMN seller_id uuid,
ADD COLUMN commission_rate numeric(5,2) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
ADD COLUMN commission_amount numeric(10,2) DEFAULT 0 CHECK (commission_amount >= 0);

-- Extend auctions table
ALTER TABLE auctions
ADD COLUMN seller_id uuid REFERENCES service_providers(id) ON DELETE SET NULL,
ADD COLUMN seller_type text CHECK (seller_type IN ('participant', 'provider', 'admin')) DEFAULT 'admin',
ADD COLUMN event_id uuid REFERENCES events(id) ON DELETE SET NULL,
ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN visibility text CHECK (visibility IN ('public', 'event_only', 'invite_only', 'hidden')) DEFAULT 'public',
ADD COLUMN commission_rate numeric(5,2) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100);

-- Create commission_settings table
CREATE TABLE commission_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL CHECK (rule_type IN ('default', 'category', 'event', 'seller', 'product_type')),
  reference_id uuid,
  commission_rate numeric(5,2) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 100),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_products_seller_id ON products(seller_id) WHERE seller_id IS NOT NULL;
CREATE INDEX idx_products_event_id ON products(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_products_project_id ON products(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_products_visibility ON products(visibility);
CREATE INDEX idx_products_approval_status ON products(approval_status);

CREATE INDEX idx_order_items_seller_id ON order_items(seller_id) WHERE seller_id IS NOT NULL;
CREATE INDEX idx_orders_event_id ON orders(event_id) WHERE event_id IS NOT NULL;

CREATE INDEX idx_auctions_seller_id ON auctions(seller_id) WHERE seller_id IS NOT NULL;
CREATE INDEX idx_auctions_event_id ON auctions(event_id) WHERE event_id IS NOT NULL;

CREATE INDEX idx_commission_settings_active ON commission_settings(is_active, rule_type);

-- Update RLS policies for products - sellers can manage own products
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;

CREATE POLICY "Admins can manage all products"
ON products FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Sellers can manage own products"
ON products FOR ALL
USING (
  seller_id IN (
    SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  seller_id IN (
    SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Public can read approved public products"
ON products FOR SELECT
USING (
  approval_status = 'approved' 
  AND visibility IN ('public', 'event_only')
  AND in_stock = true
);

-- Update RLS for order_items - sellers can view their items
CREATE POLICY "Sellers can view own order items"
ON order_items FOR SELECT
USING (
  seller_id IN (
    SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
  )
);

-- RLS for commission_settings
CREATE POLICY "Admins can manage commission_settings"
ON commission_settings FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read active commission_settings"
ON commission_settings FOR SELECT
USING (is_active = true);

-- Enable RLS
ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;

-- Trigger to update updated_at
CREATE TRIGGER update_commission_settings_updated_at
BEFORE UPDATE ON commission_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();