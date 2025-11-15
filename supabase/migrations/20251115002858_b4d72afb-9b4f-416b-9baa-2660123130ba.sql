-- =========================================
-- Value DB & RPC Layer (Lovable Block A)
-- Tables: fave_scores, contribution_scores,
--         fave_transactions, evaluation_templates, evaluations
-- Functions: calculate_fave_level,
--            recalc_user_fave_score,
--            apply_fave_transaction,
--            get_target_evaluation_summary
-- =========================================

-- Ensure pgcrypto is available for gen_random_uuid() if not already
-- (Supabase usually has this enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- TABLE: fave_scores
-- One row per user: total score + level
-- =========================================
CREATE TABLE IF NOT EXISTS public.fave_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'seed',
  last_recalculated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- TABLE: contribution_scores
-- Scores per user + domain (art, tech, organizing, docu, etc.)
-- =========================================
CREATE TABLE IF NOT EXISTS public.contribution_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_contribution_scores_user
  ON public.contribution_scores (user_id);

CREATE INDEX IF NOT EXISTS idx_contribution_scores_user_domain
  ON public.contribution_scores (user_id, domain);

-- =========================================
-- TABLE: fave_transactions
-- Immutable ledger of all score changes
-- =========================================
CREATE TABLE IF NOT EXISTS public.fave_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,            -- e.g. 'project_contribution', 'donation', etc.
  context_type TEXT,               -- e.g. 'project', 'media', 'event', 'donation'
  context_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fave_transactions_user
  ON public.fave_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_fave_transactions_user_created
  ON public.fave_transactions (user_id, created_at DESC);

-- =========================================
-- TABLE: evaluation_templates
-- What to rate per context (project_review, media_feedback, etc.)
-- =========================================
CREATE TABLE IF NOT EXISTS public.evaluation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,        -- 'project_review', 'media_feedback', 'funding_decision'
  label TEXT NOT NULL,
  description TEXT,
  dimensions JSONB NOT NULL,       -- e.g. { "clarity": "1-5", "impact": "1-5" }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- TABLE: evaluations
-- Every evaluation with ECKT + rating + dimension scores
-- =========================================
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  evaluator_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

  target_type TEXT NOT NULL,       -- 'project' | 'media' | 'proposal' | 'person'
  target_id UUID NOT NULL,

  template_id UUID REFERENCES public.evaluation_templates (id),

  rating INTEGER,                  -- optional 1–5
  eckt_value INTEGER NOT NULL CHECK (eckt_value BETWEEN 0 AND 100),

  dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,
  comment TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_evaluations_target
  ON public.evaluations (target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator
  ON public.evaluations (evaluator_id);

-- =========================================
-- RLS ENABLEMENT
-- =========================================
ALTER TABLE public.fave_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fave_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES
-- =========================================

-- fave_scores: everyone authenticated can read everyone's score (open reputation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fave_scores'
      AND policyname = 'Everyone can read fave_scores'
  ) THEN
    CREATE POLICY "Everyone can read fave_scores"
      ON public.fave_scores
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fave_scores'
      AND policyname = 'Admins can manage fave_scores'
  ) THEN
    CREATE POLICY "Admins can manage fave_scores"
      ON public.fave_scores
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

-- contribution_scores: same as fave_scores (public reputation by domain)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contribution_scores'
      AND policyname = 'Everyone can read contribution_scores'
  ) THEN
    CREATE POLICY "Everyone can read contribution_scores"
      ON public.contribution_scores
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contribution_scores'
      AND policyname = 'Admins can manage contribution_scores'
  ) THEN
    CREATE POLICY "Admins can manage contribution_scores"
      ON public.contribution_scores
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

-- fave_transactions: user sees own, admin sees all
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fave_transactions'
      AND policyname = 'User can read own fave_transactions'
  ) THEN
    CREATE POLICY "User can read own fave_transactions"
      ON public.fave_transactions
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fave_transactions'
      AND policyname = 'Admins can manage fave_transactions'
  ) THEN
    CREATE POLICY "Admins can manage fave_transactions"
      ON public.fave_transactions
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

-- evaluation_templates: readable by all; write by admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'evaluation_templates'
      AND policyname = 'Everyone can read evaluation_templates'
  ) THEN
    CREATE POLICY "Everyone can read evaluation_templates"
      ON public.evaluation_templates
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'evaluation_templates'
      AND policyname = 'Admins can manage evaluation_templates'
  ) THEN
    CREATE POLICY "Admins can manage evaluation_templates"
      ON public.evaluation_templates
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

-- evaluations: any authenticated user can insert & read; admins can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'evaluations'
      AND policyname = 'Authenticated can read evaluations'
  ) THEN
    CREATE POLICY "Authenticated can read evaluations"
      ON public.evaluations
      FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'evaluations'
      AND policyname = 'Authenticated can insert evaluations'
  ) THEN
    CREATE POLICY "Authenticated can insert evaluations"
      ON public.evaluations
      FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL AND evaluator_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'evaluations'
      AND policyname = 'Admins can manage evaluations'
  ) THEN
    CREATE POLICY "Admins can manage evaluations"
      ON public.evaluations
      FOR ALL
      USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

-- =========================================
-- FUNCTION: calculate_fave_level(score)
-- Returns a text level label based on score
-- =========================================
CREATE OR REPLACE FUNCTION public.calculate_fave_level(p_score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_score IS NULL OR p_score < 50 THEN
    RETURN 'seed';
  ELSIF p_score < 200 THEN
    RETURN 'sprout';
  ELSIF p_score < 500 THEN
    RETURN 'tree';
  ELSE
    RETURN 'forest';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =========================================
-- FUNCTION: recalc_user_fave_score(user_id)
-- Recomputes total score from transaction history (for backfill / audits)
-- =========================================
CREATE OR REPLACE FUNCTION public.recalc_user_fave_score(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(delta), 0)
  INTO total
  FROM public.fave_transactions
  WHERE user_id = p_user_id;

  total := GREATEST(total, 0);

  INSERT INTO public.fave_scores (user_id, total_score, level, last_recalculated_at)
  VALUES (p_user_id, total, public.calculate_fave_level(total), now())
  ON CONFLICT (user_id) DO UPDATE
    SET total_score = EXCLUDED.total_score,
        level = EXCLUDED.level,
        last_recalculated_at = EXCLUDED.last_recalculated_at;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- =========================================
-- FUNCTION: apply_fave_transaction(...)
-- Canonical way to mutate Fave Score (append-only ledger + incremental update)
-- =========================================
CREATE OR REPLACE FUNCTION public.apply_fave_transaction(
  p_user_id UUID,
  p_delta INTEGER,
  p_reason TEXT,
  p_context_type TEXT DEFAULT NULL,
  p_context_id UUID DEFAULT NULL,
  p_domain TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
DECLARE
  new_total INTEGER;
BEGIN
  -- Insert ledger entry
  INSERT INTO public.fave_transactions (
    user_id, delta, reason, context_type, context_id, metadata
  ) VALUES (
    p_user_id, p_delta, p_reason, p_context_type, p_context_id, p_metadata
  );

  -- Incrementally update total_score, floored at 0
  INSERT INTO public.fave_scores (user_id, total_score, level, last_recalculated_at)
  VALUES (
    p_user_id,
    GREATEST(p_delta, 0),
    public.calculate_fave_level(GREATEST(p_delta, 0)),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET total_score = GREATEST(public.fave_scores.total_score + p_delta, 0),
        level = public.calculate_fave_level(
          GREATEST(public.fave_scores.total_score + p_delta, 0)
        ),
        last_recalculated_at = now();

  -- Update contribution_scores if a domain is provided
  IF p_domain IS NOT NULL THEN
    INSERT INTO public.contribution_scores (user_id, domain, score, updated_at)
    VALUES (p_user_id, p_domain, GREATEST(p_delta, 0), now())
    ON CONFLICT (user_id, domain) DO UPDATE
      SET score = GREATEST(public.contribution_scores.score + p_delta, 0),
          updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- =========================================
-- FUNCTION: get_target_evaluation_summary(target_type, target_id)
-- Aggregates evaluations for a target and returns summary JSONB
-- =========================================
CREATE OR REPLACE FUNCTION public.get_target_evaluation_summary(
  p_target_type TEXT,
  p_target_id UUID
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  WITH evals AS (
    SELECT
      e.*,
      COALESCE(fs.total_score, 0) AS evaluator_fave
    FROM public.evaluations e
    LEFT JOIN public.fave_scores fs
      ON fs.user_id = e.evaluator_id
    WHERE e.target_type = p_target_type
      AND e.target_id = p_target_id
  ),
  enriched AS (
    SELECT
      eckt_value,
      rating,
      -- weight = capped Fave Score + 1 (so even 0-score users have some weight)
      (LEAST(GREATEST(evaluator_fave, 0), 1000) + 1)::NUMERIC AS weight
    FROM evals
  ),
  agg AS (
    SELECT
      COUNT(*) AS count,
      AVG(eckt_value)::NUMERIC AS avg_eckt,
      AVG(rating)::NUMERIC AS avg_rating,
      CASE
        WHEN SUM(weight) > 0
        THEN SUM(eckt_value * weight) / SUM(weight)
        ELSE NULL
      END AS weighted_eckt
    FROM enriched
  )
  SELECT jsonb_build_object(
    'count', COALESCE(count, 0),
    'avg_eckt', COALESCE(avg_eckt, 0),
    'weighted_eckt', COALESCE(weighted_eckt, 0),
    'avg_rating', COALESCE(avg_rating, 0)
  )
  INTO result
  FROM agg;

  IF result IS NULL THEN
    RETURN jsonb_build_object(
      'count', 0,
      'avg_eckt', 0,
      'weighted_eckt', 0,
      'avg_rating', 0
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;