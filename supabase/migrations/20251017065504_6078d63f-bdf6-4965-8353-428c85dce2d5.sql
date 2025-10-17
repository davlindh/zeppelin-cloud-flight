-- Drop old admin_users table and related functions
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_email(text) CASCADE;

-- Update all policies to use has_role instead of is_admin
-- Admin settings policies
DROP POLICY IF EXISTS "Admins can manage admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Only admins can read admin_settings" ON public.admin_settings;
CREATE POLICY "Admins can manage admin_settings" ON public.admin_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Auctions policies
DROP POLICY IF EXISTS "Admins can manage auctions" ON public.auctions;
CREATE POLICY "Admins can manage auctions" ON public.auctions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Bid history policies
DROP POLICY IF EXISTS "Admins can manage bid_history" ON public.bid_history;
CREATE POLICY "Admins can manage bid_history" ON public.bid_history
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Bookings policies
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Admins can manage bookings" ON public.bookings
  FOR ALL USING (has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can read their own bookings" ON public.bookings;
CREATE POLICY "Users can read their own bookings" ON public.bookings
  FOR SELECT USING ((auth.uid()::text = customer_email) OR has_role(auth.uid(), 'admin'));

-- Categories policies
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Category metadata policies
DROP POLICY IF EXISTS "Admins can manage category_metadata" ON public.category_metadata;
CREATE POLICY "Admins can manage category_metadata" ON public.category_metadata
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Communication requests policies
DROP POLICY IF EXISTS "Admins can manage communication_requests" ON public.communication_requests;
CREATE POLICY "Admins can manage communication_requests" ON public.communication_requests
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Media items policies
DROP POLICY IF EXISTS "Admin can manage all media" ON public.media_items;
CREATE POLICY "Admin can manage all media" ON public.media_items
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Participant media policies
DROP POLICY IF EXISTS "Admins can manage participant_media" ON public.participant_media;
CREATE POLICY "Admins can manage participant_media" ON public.participant_media
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Product reviews policies
DROP POLICY IF EXISTS "Admins can manage product_reviews" ON public.product_reviews;
CREATE POLICY "Admins can manage product_reviews" ON public.product_reviews
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Product variants policies
DROP POLICY IF EXISTS "Admins can manage product_variants" ON public.product_variants;
CREATE POLICY "Admins can manage product_variants" ON public.product_variants
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Products policies
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project access policies
DROP POLICY IF EXISTS "Admins can manage project_access" ON public.project_access;
CREATE POLICY "Admins can manage project_access" ON public.project_access
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project budget policies
DROP POLICY IF EXISTS "Admins can manage project_budget" ON public.project_budget;
CREATE POLICY "Admins can manage project_budget" ON public.project_budget
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project links policies
DROP POLICY IF EXISTS "Admins can manage project_links" ON public.project_links;
CREATE POLICY "Admins can manage project_links" ON public.project_links
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project media policies
DROP POLICY IF EXISTS "Admins can manage project_media" ON public.project_media;
CREATE POLICY "Admins can manage project_media" ON public.project_media
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project participants policies
DROP POLICY IF EXISTS "Admins can manage project_participants" ON public.project_participants;
CREATE POLICY "Admins can manage project_participants" ON public.project_participants
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project sponsors policies
DROP POLICY IF EXISTS "Admins can manage project_sponsors" ON public.project_sponsors;
CREATE POLICY "Admins can manage project_sponsors" ON public.project_sponsors
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project tags policies
DROP POLICY IF EXISTS "Admins can manage project_tags" ON public.project_tags;
CREATE POLICY "Admins can manage project_tags" ON public.project_tags
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project timeline policies
DROP POLICY IF EXISTS "Admins can manage project_timeline" ON public.project_timeline;
CREATE POLICY "Admins can manage project_timeline" ON public.project_timeline
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Project voting policies
DROP POLICY IF EXISTS "Admins can manage project_voting" ON public.project_voting;
CREATE POLICY "Admins can manage project_voting" ON public.project_voting
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Service portfolio items policies
DROP POLICY IF EXISTS "Admins can manage service_portfolio_items" ON public.service_portfolio_items;
CREATE POLICY "Admins can manage service_portfolio_items" ON public.service_portfolio_items
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Service providers policies
DROP POLICY IF EXISTS "Admins can manage service_providers" ON public.service_providers;
CREATE POLICY "Admins can manage service_providers" ON public.service_providers
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Service reviews policies
DROP POLICY IF EXISTS "Admins can manage service_reviews" ON public.service_reviews;
CREATE POLICY "Admins can manage service_reviews" ON public.service_reviews
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Services policies
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (has_role(auth.uid(), 'admin'));