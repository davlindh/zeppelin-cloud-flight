-- ============================================================================
-- MARKETPLACE INTEGRATION MIGRATION
-- Adds Auction Emporium tables to the main Zeppelin database
-- ============================================================================

-- Create enum types for marketplace data consistency
CREATE TYPE auction_condition AS ENUM ('new', 'like-new', 'good', 'fair', 'poor');
CREATE TYPE auction_category AS ENUM ('electronics', 'fashion', 'home', 'sports', 'books', 'art', 'collectibles', 'automotive');
CREATE TYPE service_category AS ENUM ('photography', 'design', 'consulting', 'tutoring', 'fitness', 'beauty', 'home-services', 'event-planning', 'legal', 'accounting');
CREATE TYPE product_category AS ENUM ('electronics', 'clothing', 'home', 'sports', 'books', 'beauty', 'toys', 'automotive');
CREATE TYPE communication_type AS ENUM ('message', 'consultation', 'quote');
CREATE TYPE communication_status AS ENUM ('sent', 'delivered', 'read', 'responded', 'completed');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- ============================================================================
-- CATEGORIES SYSTEM (Unified hierarchical system)
-- ============================================================================

CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES public.categories(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.category_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  icon_name TEXT,
  color_scheme JSONB DEFAULT '{"bg": "bg-slate-50", "text": "text-slate-700", "border": "border-slate-200"}',
  image_url TEXT,
  search_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- PRODUCTS SYSTEM
-- ============================================================================

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  article_number TEXT UNIQUE,
  barcode TEXT,
  slug TEXT UNIQUE,
  cost_price NUMERIC(10,2) DEFAULT 0,
  selling_price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  tax_rate NUMERIC(5,2) DEFAULT 25.00,
  category_id UUID REFERENCES public.categories(id),
  product_brand TEXT,
  product_group TEXT,
  product_type TEXT DEFAULT 'product',
  stock_quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  is_stock_item BOOLEAN DEFAULT true,
  in_stock BOOLEAN DEFAULT true,
  supplier TEXT,
  image TEXT NOT NULL DEFAULT '',
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  material TEXT,
  sku TEXT UNIQUE,
  price_adjustment NUMERIC(10,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chk_variant_has_attribute CHECK (
    size IS NOT NULL OR color IS NOT NULL OR material IS NOT NULL
  ),
  UNIQUE(product_id, size, color, material)
);

CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- AUCTIONS SYSTEM
-- ============================================================================

CREATE TABLE public.auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  current_bid NUMERIC(10,2) NOT NULL DEFAULT 0,
  starting_bid NUMERIC(10,2) NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  bidders INTEGER NOT NULL DEFAULT 0,
  category auction_category NOT NULL,
  condition auction_condition NOT NULL,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  slug TEXT UNIQUE,
  winner_id UUID,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.bid_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder TEXT NOT NULL,
  bidder_email TEXT,
  amount NUMERIC(10,2) NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_auto_bid BOOLEAN DEFAULT false,
  user_id UUID,
  bid_type TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- SERVICES SYSTEM
-- ============================================================================

CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews INTEGER NOT NULL DEFAULT 0,
  experience TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialties TEXT[],
  certifications TEXT[],
  response_time TEXT,
  completed_projects INTEGER DEFAULT 0,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews INTEGER NOT NULL DEFAULT 0,
  starting_price NUMERIC(10,2) NOT NULL,
  duration TEXT NOT NULL,
  category service_category NOT NULL,
  location TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  available_times TEXT[] DEFAULT '{}',
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE,
  provider_rating NUMERIC(3,2),
  response_time TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_message TEXT NOT NULL,
  selected_date TEXT NOT NULL,
  selected_time TEXT NOT NULL,
  customizations JSONB NOT NULL DEFAULT '{}',
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  status booking_status NOT NULL DEFAULT 'pending',
  total_price NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.service_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  rating NUMERIC(3,2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.service_portfolio_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- COMMUNICATION SYSTEM
-- ============================================================================

CREATE TABLE public.communication_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type communication_type NOT NULL,
  reference_number TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status communication_status NOT NULL DEFAULT 'sent',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_email TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT,
  service_price NUMERIC(10,2),
  subject TEXT,
  message TEXT NOT NULL,
  additional_data JSONB,
  provider_response TEXT,
  response_timestamp TIMESTAMP WITH TIME ZONE,
  estimated_response_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Products indexes
CREATE INDEX idx_products_category_stock ON public.products(category_id, in_stock, selling_price);
CREATE INDEX idx_products_brand ON public.products(product_brand);
CREATE INDEX idx_products_in_stock ON public.products(in_stock);
CREATE INDEX idx_products_slug ON public.products(slug);

-- Auctions indexes
CREATE INDEX idx_auctions_category ON public.auctions(category);
CREATE INDEX idx_auctions_end_time ON public.auctions(end_time);
CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_bid_history_auction_time ON public.bid_history(auction_id, time DESC);

-- Services indexes
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_available ON public.services(available);
CREATE INDEX idx_services_location_available ON public.services(location, available);
CREATE INDEX idx_services_provider ON public.services(provider_id);

-- Bookings indexes
CREATE INDEX idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_date ON public.bookings(selected_date);

-- Communication indexes
CREATE INDEX idx_communication_requests_provider ON public.communication_requests(provider_id);
CREATE INDEX idx_communication_requests_status ON public.communication_requests(status);

-- Categories indexes
CREATE INDEX idx_categories_active ON public.categories(is_active);
CREATE INDEX idx_categories_parent ON public.categories(parent_category_id);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('auction-images', 'auction-images', true),
  ('service-images', 'service-images', true),
  ('provider-avatars', 'provider-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (Public read, Admin write)
-- Note: Uses existing is_admin() function from main Zeppelin database
-- ============================================================================

-- Categories policies
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public read access for category_metadata" ON public.category_metadata FOR SELECT USING (true);
CREATE POLICY "Admins can manage category_metadata" ON public.category_metadata FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

-- Products policies
CREATE POLICY "Public read access for products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public read access for product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can manage product_variants" ON public.product_variants FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public read access for product_reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Guests can create product_reviews" ON product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage product_reviews" ON public.product_reviews FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

-- Auctions policies
CREATE POLICY "Public read access for auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Admins can manage auctions" ON public.auctions FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public read access for bid_history" ON public.bid_history FOR SELECT USING (true);
CREATE POLICY "Guests can place bids" ON public.bid_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage bid_history" ON public.bid_history FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

-- Services policies
CREATE POLICY "Public read access for service_providers" ON public.service_providers FOR SELECT USING (true);
CREATE POLICY "Admins can manage service_providers" ON public.service_providers FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public read access for services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public read access for bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Guests can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public read access for service_reviews" ON public.service_reviews FOR SELECT USING (true);
CREATE POLICY "Guests can create service_reviews" ON public.service_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage service_reviews" ON public.service_reviews FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public read access for service_portfolio_items" ON public.service_portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage service_portfolio_items" ON public.service_portfolio_items FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

-- Communication policies
CREATE POLICY "Public read access for communication_requests" ON public.communication_requests FOR SELECT USING (true);
CREATE POLICY "Guests can create communication_requests" ON public.communication_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage communication_requests" ON public.communication_requests FOR ALL USING (public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public can view auction images" ON storage.objects FOR SELECT USING (bucket_id = 'auction-images');
CREATE POLICY "Admins can upload auction images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'auction-images' AND public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public can view service images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Admins can upload service images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'service-images' AND public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

CREATE POLICY "Public can view provider avatars" ON storage.objects FOR SELECT USING (bucket_id = 'provider-avatars');
CREATE POLICY "Admins can upload provider avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'provider-avatars' AND public.is_admin((current_setting('request.jwt.claims', true)::json->>'email')::text));

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_category_metadata_updated_at BEFORE UPDATE ON public.category_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON public.auctions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_portfolio_items_updated_at BEFORE UPDATE ON public.service_portfolio_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_communication_requests_updated_at BEFORE UPDATE ON public.communication_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- AUTOMATIC STOCK STATUS UPDATES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_product_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.in_stock = (NEW.stock_quantity > 0 AND NEW.is_stock_item = true);
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_stock_status_trigger 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW 
  WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity OR OLD.is_stock_item IS DISTINCT FROM NEW.is_stock_item)
  EXECUTE FUNCTION public.update_product_stock_status();

-- ============================================================================
-- ATOMIC BID PLACEMENT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.place_bid(
  p_auction_id UUID,
  p_bidder TEXT,
  p_amount NUMERIC(10,2)
) RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  new_current_bid NUMERIC(10,2),
  new_bidder_count INTEGER
) AS $$
DECLARE
  v_current_bid NUMERIC(10,2);
  v_end_time TIMESTAMP WITH TIME ZONE;
  v_bidders INTEGER;
BEGIN
  -- Get current auction state
  SELECT current_bid, end_time, bidders INTO v_current_bid, v_end_time, v_bidders
  FROM public.auctions
  WHERE id = p_auction_id
  FOR UPDATE;
  
  -- Check if auction exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Auction not found'::TEXT, 0::NUMERIC(10,2), 0::INTEGER;
    RETURN;
  END IF;
  
  -- Check if auction has ended
  IF v_end_time < NOW() THEN
    RETURN QUERY SELECT false, 'Auction has ended'::TEXT, v_current_bid, v_bidders;
    RETURN;
  END IF;
  
  -- Check if bid is higher than current bid
  IF p_amount <= v_current_bid THEN
    RETURN QUERY SELECT false, 'Bid must be higher than current bid'::TEXT, v_current_bid, v_bidders;
    RETURN;
  END IF;
  
  -- Update auction with new bid
  UPDATE public.auctions
  SET current_bid = p_amount,
      bidders = bidders + 1,
      updated_at = NOW()
  WHERE id = p_auction_id;
  
  -- Insert bid into history
  INSERT INTO public.bid_history (auction_id, bidder, amount)
  VALUES (p_auction_id, p_bidder, p_amount);
  
  -- Return success
  RETURN QUERY SELECT true, 'Bid placed successfully'::TEXT, p_amount, v_bidders + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
