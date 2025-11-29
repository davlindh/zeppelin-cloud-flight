-- Drop backup tables without RLS (security issue: backup_tables_no_rls)
DROP TABLE IF EXISTS public.media_library_backup_20251018;
DROP TABLE IF EXISTS public.participant_media_backup_20251018;
DROP TABLE IF EXISTS public.project_media_backup_20251018;

-- Drop insecure is_admin function that checks email (security issue: is_admin_jwt_email_check)
DROP FUNCTION IF EXISTS public.is_admin(text);
DROP FUNCTION IF EXISTS public.is_admin(text, uuid);

-- Enhance place_bid function with proper validation (security issue: rpc_place_bid_no_validation)
CREATE OR REPLACE FUNCTION public.place_bid(
  p_auction_id uuid,
  p_bidder text,
  p_amount numeric
)
RETURNS TABLE(
  success boolean,
  message text,
  new_current_bid numeric,
  new_bidder_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_bid NUMERIC(10,2);
  v_end_time TIMESTAMP WITH TIME ZONE;
  v_bidders INTEGER;
  v_status TEXT;
  v_min_increment NUMERIC := 10.00; -- Minimum bid increment
BEGIN
  -- Input validation
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN QUERY SELECT false, 'Bid amount must be positive'::TEXT, 0::NUMERIC(10,2), 0::INTEGER;
    RETURN;
  END IF;
  
  -- Prevent extremely large bids (overflow protection)
  IF p_amount > 999999999 THEN
    RETURN QUERY SELECT false, 'Bid amount exceeds maximum allowed'::TEXT, 0::NUMERIC(10,2), 0::INTEGER;
    RETURN;
  END IF;
  
  -- Validate bidder name
  IF p_bidder IS NULL OR LENGTH(TRIM(p_bidder)) = 0 THEN
    RETURN QUERY SELECT false, 'Bidder name is required'::TEXT, 0::NUMERIC(10,2), 0::INTEGER;
    RETURN;
  END IF;

  -- Get current auction state with row lock
  SELECT current_bid, end_time, bidders, status 
  INTO v_current_bid, v_end_time, v_bidders, v_status
  FROM public.auctions
  WHERE id = p_auction_id
  FOR UPDATE;
  
  -- Check if auction exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Auction not found'::TEXT, 0::NUMERIC(10,2), 0::INTEGER;
    RETURN;
  END IF;
  
  -- Check if auction is active
  IF v_status != 'active' THEN
    RETURN QUERY SELECT false, 'Auction is not active'::TEXT, v_current_bid, v_bidders;
    RETURN;
  END IF;
  
  -- Check if auction has ended
  IF v_end_time < NOW() THEN
    RETURN QUERY SELECT false, 'Auction has ended'::TEXT, v_current_bid, v_bidders;
    RETURN;
  END IF;
  
  -- Enforce minimum bid increment
  IF p_amount < v_current_bid + v_min_increment THEN
    RETURN QUERY SELECT 
      false, 
      format('Bid must be at least %s (minimum increment: %s)', 
             (v_current_bid + v_min_increment)::TEXT, 
             v_min_increment::TEXT)::TEXT, 
      v_current_bid, 
      v_bidders;
    RETURN;
  END IF;
  
  -- Update auction with new bid
  UPDATE public.auctions
  SET 
    current_bid = p_amount,
    bidders = bidders + 1,
    updated_at = NOW()
  WHERE id = p_auction_id;
  
  -- Insert bid into history
  INSERT INTO public.bid_history (auction_id, bidder, amount)
  VALUES (p_auction_id, p_bidder, p_amount);
  
  -- Return success
  RETURN QUERY SELECT true, 'Bid placed successfully'::TEXT, p_amount, v_bidders + 1;
END;
$$;