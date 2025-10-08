-- Add RLS policies for marketplace tables

-- ============================================================================
-- CATEGORIES AND METADATA POLICIES
-- ============================================================================

-- Categories: Public read, admins manage
CREATE POLICY "Public can read categories"
ON public.categories FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (public.is_admin());

-- Category Metadata: Public read, admins manage
CREATE POLICY "Public can read category_metadata"
ON public.category_metadata FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage category_metadata"
ON public.category_metadata FOR ALL
TO authenticated
USING (public.is_admin());

-- ============================================================================
-- PRODUCTS SYSTEM POLICIES
-- ============================================================================

-- Products: Public read, admins manage
CREATE POLICY "Public can read products"
ON public.products FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (public.is_admin());

-- Product Variants: Public read, admins manage
CREATE POLICY "Public can read product_variants"
ON public.product_variants FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage product_variants"
ON public.product_variants FOR ALL
TO authenticated
USING (public.is_admin());

-- Product Reviews: Public read, guests can create, admins manage
CREATE POLICY "Public can read product_reviews"
ON public.product_reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can create product_reviews"
ON public.product_reviews FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage product_reviews"
ON public.product_reviews FOR ALL
TO authenticated
USING (public.is_admin());

-- ============================================================================
-- AUCTIONS SYSTEM POLICIES
-- ============================================================================

-- Auctions: Public read, admins manage
CREATE POLICY "Public can read auctions"
ON public.auctions FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage auctions"
ON public.auctions FOR ALL
TO authenticated
USING (public.is_admin());

-- Bid History: Public read, guests can place bids, admins manage
CREATE POLICY "Public can read bid_history"
ON public.bid_history FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can place bids"
ON public.bid_history FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage bid_history"
ON public.bid_history FOR ALL
TO authenticated
USING (public.is_admin());

-- ============================================================================
-- SERVICES SYSTEM POLICIES
-- ============================================================================

-- Service Providers: Public read, admins manage
CREATE POLICY "Public can read service_providers"
ON public.service_providers FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage service_providers"
ON public.service_providers FOR ALL
TO authenticated
USING (public.is_admin());

-- Services: Public read, admins manage
CREATE POLICY "Public can read services"
ON public.services FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage services"
ON public.services FOR ALL
TO authenticated
USING (public.is_admin());

-- Service Reviews: Public read, guests can create, admins manage
CREATE POLICY "Public can read service_reviews"
ON public.service_reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can create service_reviews"
ON public.service_reviews FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage service_reviews"
ON public.service_reviews FOR ALL
TO authenticated
USING (public.is_admin());

-- Service Portfolio Items: Public read, admins manage
CREATE POLICY "Public can read service_portfolio_items"
ON public.service_portfolio_items FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage service_portfolio_items"
ON public.service_portfolio_items FOR ALL
TO authenticated
USING (public.is_admin());

-- Bookings: Users can read their own bookings, guests can create, admins manage all
CREATE POLICY "Users can read their own bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid()::text = customer_email OR public.is_admin());

CREATE POLICY "Anyone can create bookings"
ON public.bookings FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage bookings"
ON public.bookings FOR ALL
TO authenticated
USING (public.is_admin());

-- ============================================================================
-- COMMUNICATION SYSTEM POLICIES
-- ============================================================================

-- Communication Requests: Public read for providers, guests can create, admins manage
CREATE POLICY "Public can read communication_requests"
ON public.communication_requests FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can create communication_requests"
ON public.communication_requests FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage communication_requests"
ON public.communication_requests FOR ALL
TO authenticated
USING (public.is_admin());