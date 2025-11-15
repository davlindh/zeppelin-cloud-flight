-- =========================================
-- Block B Phase 1: Value Engine Wiring
-- Database triggers for media, bookings, and product reviews
-- =========================================

-- =========================================
-- 1. Media Approval Points
-- Trigger: Award points when media status changes to 'approved'
-- =========================================
CREATE OR REPLACE FUNCTION public.award_media_approval_points()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Only award points on status change to 'approved'
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    v_user_id := NULL;
    
    -- Get user_id from uploaded_by or participant
    IF NEW.uploaded_by IS NOT NULL THEN
      v_user_id := NEW.uploaded_by;
    ELSIF NEW.participant_id IS NOT NULL THEN
      SELECT auth_user_id INTO v_user_id 
      FROM participants 
      WHERE id = NEW.participant_id;
    END IF;
    
    -- Award points if we found a user
    IF v_user_id IS NOT NULL THEN
      PERFORM apply_fave_transaction(
        v_user_id,
        20,
        'media_approved',
        'media',
        NEW.id,
        'content_creation',
        jsonb_build_object(
          'media_type', NEW.type,
          'media_title', NEW.title
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_award_media_approval
  AFTER UPDATE ON public.media_library
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.award_media_approval_points();

-- =========================================
-- 2. Booking Completion Points
-- Add rating fields to bookings table
-- =========================================
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS review_comment TEXT;

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Trigger: Award points when booking completes with rating
CREATE OR REPLACE FUNCTION public.award_booking_completion_points()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_user_id UUID;
BEGIN
  -- When booking moves to 'completed' with a rating
  IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.rating IS NOT NULL THEN
    
    -- Get provider's user_id from service
    SELECT sp.auth_user_id INTO v_provider_user_id
    FROM services s
    JOIN service_providers sp ON s.provider_id = sp.id
    WHERE s.id = NEW.service_id;
    
    -- Award points to provider (scaled by rating)
    IF v_provider_user_id IS NOT NULL THEN
      PERFORM apply_fave_transaction(
        v_provider_user_id,
        CASE 
          WHEN NEW.rating >= 4 THEN 30
          WHEN NEW.rating = 3 THEN 15
          ELSE 5
        END,
        'booking_completed',
        'booking',
        NEW.id,
        'service_delivery',
        jsonb_build_object(
          'rating', NEW.rating,
          'service_id', NEW.service_id
        )
      );
    END IF;
    
    -- Award points to customer for leaving review (if authenticated)
    IF NEW.user_id IS NOT NULL THEN
      PERFORM apply_fave_transaction(
        NEW.user_id,
        5,
        'booking_reviewed',
        'booking',
        NEW.id,
        'engagement',
        jsonb_build_object('rating', NEW.rating)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_award_booking_points
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.rating IS DISTINCT FROM NEW.rating)
  EXECUTE FUNCTION public.award_booking_completion_points();

-- =========================================
-- 3. Product Review Points
-- Trigger: Award points when product review is created
-- =========================================
CREATE OR REPLACE FUNCTION public.award_product_review_points()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_user_id UUID;
BEGIN
  -- Get seller's user_id based on seller_type
  SELECT 
    CASE 
      WHEN p.seller_type = 'provider' THEN sp.auth_user_id
      WHEN p.seller_type = 'participant' THEN part.auth_user_id
      ELSE NULL
    END INTO v_seller_user_id
  FROM products p
  LEFT JOIN service_providers sp ON p.seller_id = sp.id AND p.seller_type = 'provider'
  LEFT JOIN participants part ON p.seller_id = part.id AND p.seller_type = 'participant'
  WHERE p.id = NEW.product_id;
  
  -- Award points to seller (scaled by rating, only for positive reviews)
  IF v_seller_user_id IS NOT NULL AND NEW.rating >= 4 THEN
    PERFORM apply_fave_transaction(
      v_seller_user_id,
      CASE 
        WHEN NEW.rating = 5 THEN 25
        WHEN NEW.rating = 4 THEN 15
        ELSE 10
      END,
      'product_positive_review',
      'product',
      NEW.product_id,
      'commerce',
      jsonb_build_object('rating', NEW.rating, 'review_id', NEW.id)
    );
  END IF;
  
  -- Award points to reviewer
  PERFORM apply_fave_transaction(
    NEW.user_id,
    5,
    'product_reviewed',
    'product_review',
    NEW.id,
    'engagement',
    jsonb_build_object('rating', NEW.rating)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_award_product_review_points
  AFTER INSERT ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.award_product_review_points();