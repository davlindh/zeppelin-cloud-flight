-- Fix remaining Function Search Path Mutable warnings

-- Fix validate_submission_content
CREATE OR REPLACE FUNCTION public.validate_submission_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Validate required fields based on submission type
  CASE NEW.type
    WHEN 'project' THEN
      -- Project submissions should have purpose, expected_impact OR description
      IF NOT (NEW.content ? 'purpose' OR NEW.content ? 'description') THEN
        RAISE EXCEPTION 'Project submissions must include purpose or description';
      END IF;
    WHEN 'participant' THEN
      -- Participant submissions should have bio OR description, and some form of skills/roles
      IF NOT (
        (NEW.content ? 'bio' OR NEW.content ? 'description') AND 
        (NEW.content ? 'skills' OR NEW.content ? 'roles' OR NEW.content ? 'contributions' OR NEW.content ? 'experienceLevel')
      ) THEN
        RAISE EXCEPTION 'Participant submissions must include bio/description and skills/roles information';
      END IF;
    WHEN 'media' THEN
      -- Media submissions should have media_type, category, uploader_name, uploader_email
      IF NOT (
        NEW.content ? 'media_type' AND 
        NEW.content ? 'category' AND 
        NEW.content ? 'uploader_name' AND 
        NEW.content ? 'uploader_email'
      ) THEN
        RAISE EXCEPTION 'Media submissions must include media_type, category, uploader_name, and uploader_email';
      END IF;
    WHEN 'partnership' THEN
      -- Partnership submissions should have organization, partnership_type
      IF NOT (NEW.content ? 'organization' AND NEW.content ? 'partnership_type') THEN
        RAISE EXCEPTION 'Partnership submissions must include organization and partnership_type';
      END IF;
    WHEN 'collaboration' THEN
      -- Collaboration submissions should have collaboration_type, availability
      IF NOT (NEW.content ? 'collaboration_type' AND NEW.content ? 'availability') THEN
        RAISE EXCEPTION 'Collaboration submissions must include collaboration_type and availability';
      END IF;
    ELSE
      -- For unknown types, just log and allow (graceful handling)
      RAISE NOTICE 'Unknown submission type: %', NEW.type;
  END CASE;
  
  RETURN NEW;
END;
$function$;

-- Fix place_bid
CREATE OR REPLACE FUNCTION public.place_bid(p_auction_id uuid, p_bidder text, p_amount numeric)
RETURNS TABLE(success boolean, message text, new_current_bid numeric, new_bidder_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;