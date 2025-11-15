-- Award Fave Points for service reviews
-- Provider gets 5-30 points based on rating quality
-- Reviewer gets +5 points for leaving feedback

CREATE OR REPLACE FUNCTION award_service_review_points()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_id uuid;
  v_provider_points integer;
BEGIN
  -- Get the provider_id from the service
  SELECT provider_id INTO v_provider_id
  FROM services
  WHERE id = NEW.service_id;

  -- Calculate provider points based on rating (0-100 scale)
  IF NEW.rating >= 80 THEN
    v_provider_points := 30;
  ELSIF NEW.rating >= 60 THEN
    v_provider_points := 20;
  ELSIF NEW.rating >= 40 THEN
    v_provider_points := 10;
  ELSE
    v_provider_points := 5;
  END IF;

  -- Award points to provider (via their auth_user_id)
  IF v_provider_id IS NOT NULL THEN
    INSERT INTO fave_transactions (user_id, delta, reason, context_type, context_id, metadata)
    SELECT 
      sp.auth_user_id,
      v_provider_points,
      'Service review received',
      'service_review',
      NEW.id,
      jsonb_build_object(
        'service_id', NEW.service_id,
        'rating', NEW.rating,
        'review_id', NEW.id
      )
    FROM service_providers sp
    WHERE sp.id = v_provider_id AND sp.auth_user_id IS NOT NULL;
  END IF;

  -- Award +5 points to reviewer if authenticated
  IF NEW.customer_id IS NOT NULL THEN
    INSERT INTO fave_transactions (user_id, delta, reason, context_type, context_id, metadata)
    VALUES (
      NEW.customer_id,
      5,
      'Left service review',
      'service_review',
      NEW.id,
      jsonb_build_object(
        'service_id', NEW.service_id,
        'rating', NEW.rating
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for service reviews
DROP TRIGGER IF EXISTS trigger_award_service_review_points ON service_reviews;
CREATE TRIGGER trigger_award_service_review_points
  AFTER INSERT ON service_reviews
  FOR EACH ROW
  EXECUTE FUNCTION award_service_review_points();