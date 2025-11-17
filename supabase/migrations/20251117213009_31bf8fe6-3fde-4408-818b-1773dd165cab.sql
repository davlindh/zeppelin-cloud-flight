-- Create function to get top donors for a campaign
CREATE OR REPLACE FUNCTION public.get_campaign_top_donors(p_campaign_id uuid)
RETURNS TABLE (
  donor_user_id uuid,
  donor_name text,
  total_donated numeric,
  currency text,
  fave_score integer,
  fave_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.donor_user_id,
    MAX(d.donor_name) as donor_name,
    SUM(d.amount) as total_donated,
    MAX(d.currency) as currency,
    COALESCE(MAX(fs.total_score), 0)::integer as fave_score,
    COALESCE(MAX(fs.level), 'seed'::text) as fave_level
  FROM donations d
  LEFT JOIN fave_scores fs ON d.donor_user_id = fs.user_id
  WHERE d.campaign_id = p_campaign_id
    AND d.status = 'succeeded'
    AND d.is_anonymous = false
    AND d.donor_user_id IS NOT NULL
  GROUP BY d.donor_user_id
  ORDER BY total_donated DESC
  LIMIT 10;
END;
$$;