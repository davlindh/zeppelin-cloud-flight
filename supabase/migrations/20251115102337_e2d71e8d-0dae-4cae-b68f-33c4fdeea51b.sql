-- Update get_target_evaluation_summary to accept context parameters
DROP FUNCTION IF EXISTS public.get_target_evaluation_summary(text, uuid);

CREATE OR REPLACE FUNCTION public.get_target_evaluation_summary(
  p_target_type TEXT,
  p_target_id UUID,
  p_context_scope TEXT DEFAULT NULL,
  p_context_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'count', COUNT(*)::int,
    'avg_eckt', COALESCE(AVG(eckt_value), 0)::numeric(10,2),
    'weighted_eckt', COALESCE(
      SUM(eckt_value * COALESCE(fs.total_score, 1)) / NULLIF(SUM(COALESCE(fs.total_score, 1)), 0),
      0
    )::numeric(10,2),
    'avg_rating', COALESCE(AVG(rating), 0)::numeric(10,2)
  )
  INTO result
  FROM evaluations e
  LEFT JOIN fave_scores fs ON e.evaluator_id = fs.user_id
  WHERE e.target_type = p_target_type
    AND e.target_id = p_target_id
    AND (p_context_scope IS NULL OR e.context_scope = p_context_scope)
    AND (p_context_id IS NULL OR e.context_id = p_context_id);

  RETURN result;
END;
$$;