-- REPUTATION SYSTEM DATABASE SETUP
-- Run this SQL script to enable the complete reputation system
-- This addresses the missing database tables from the previous incomplete implementation

-- 1. FACTIONS TRANSACTIONS TABLE
-- Records all point changes (gains and losses) with context
CREATE TABLE public.fave_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL, -- Positive = gain, Negative = loss
  reason TEXT NOT NULL, -- donation_made, event_attendance, project_contribution, etc.
  context_type TEXT, -- funding_campaign, event_ticket, project
  context_id TEXT, -- Reference ID of the context
  metadata JSONB DEFAULT '{}', -- Additional data like donation amount, event name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CHECK (delta != 0), -- No zero transactions
  CHECK (reason IN (
    'donation_made', 'event_attendance', 'project_contribution',
    'collaboration_points', 'task_completed', 'milestone_reached',
    'donation_refunded', 'admin_adjustment'
  ))
);

-- 2. ACHIEVEMENT DEFINITIONS
CREATE TABLE public.achievement_definitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'score', -- score, donation, events, collaboration
  criteria JSONB NOT NULL DEFAULT '{}', -- Criteria for unlocking
  level_requirement INTEGER DEFAULT 0,
  skill_requirement TEXT[], -- Array of required skills/none
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. USER ACHIEVEMENT UNLOCKS
CREATE TABLE public.user_achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress_value INTEGER DEFAULT 0,
  context_metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id) -- One per achievement per user
);

-- PERFORMANCE INDEXES
CREATE INDEX idx_fave_transactions_user_id ON public.fave_transactions(user_id);
CREATE INDEX idx_fave_transactions_created_at ON public.fave_transactions(created_at DESC);
CREATE INDEX idx_fave_transactions_reason ON public.fave_transactions(reason);
CREATE INDEX idx_user_achievement_unlocks_user_id ON public.user_achievement_unlocks(user_id);
CREATE INDEX idx_user_achievement_unlocks_achievement_id ON public.user_achievement_unlocks(achievement_id);

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE public.fave_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievement_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR TRANSACTIONS
CREATE POLICY "Users can read own fave transactions"
  ON public.fave_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage fave transactions"
  ON public.fave_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS POLICIES FOR ACHIEVEMENTS
CREATE POLICY "Anyone can read achievement definitions"
  ON public.achievement_definitions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage achievement definitions"
  ON public.achievement_definitions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS POLICIES FOR USER ACHIEVEMENT UNLOCKS
CREATE POLICY "Users can read own achievement unlocks"
  ON public.user_achievement_unlocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage achievement unlocks"
  ON public.user_achievement_unlocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- DEFAULT ACHIEVEMENTS
INSERT INTO public.achievement_definitions (id, title, description, icon, category, criteria, level_requirement) VALUES
  ('first-points', 'Getting Started', 'Earn your first Fave points', 'award', 'score', '{"min_score": 10}', 0),
  ('hundred-club', 'Century Club', 'Reach 100 Fave points', 'trophy', 'score', '{"min_score": 100}', 100),
  ('point-master', 'Point Master', 'Accumulate 500 Fave points', 'star', 'score', '{"min_score": 500}', 500),
  ('legend', 'Legend', 'Reach 1000+ Fave points', 'award', 'score', '{"min_score": 1000}', 1000),
  ('first-donation', 'Generous Heart', 'Make your first donation', 'heart', 'donation', '{"donation_count": 1}', 0),
  ('donation-champion', 'Donation Champion', 'Donate 1000+ SEK total', 'medal', 'donation', '{"total_donated": 1000}', 0),
  ('philanthropist', 'Philanthropist', 'Donate 5000+ SEK total', 'trophy', 'donation', '{"total_donated": 5000}', 0),
  ('event-explorer', 'Event Explorer', 'Attend your first event', 'target', 'events', '{"events_attended": 1}', 0),
  ('social-butterfly', 'Social Butterfly', 'Attend 5 different events', 'users', 'events', '{"events_attended": 5}', 0),
  ('event-regular', 'Event Regular', 'Attend 10 different events', 'star', 'events', '{"events_attended": 10}', 0);

-- FUNCTIONS FOR SCORE MANAGEMENT
CREATE OR REPLACE FUNCTION public.recalculate_fave_score(target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  total_score INTEGER,
  recalculated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  calculated_total INTEGER;
BEGIN
  -- Calculate total from all approved transactions
  SELECT COALESCE(SUM(delta), 0)
  INTO calculated_total
  FROM public.fave_transactions
  WHERE fave_transactions.user_id = target_user_id;

  -- Update or insert the fave_score
  INSERT INTO public.fave_scores (user_id, total_score, last_recalculated_at)
  VALUES (target_user_id, GREATEST(calculated_total, 0), now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_score = GREATEST(calculated_total, 0),
    last_recalculated_at = now();

  RETURN QUERY
  SELECT target_user_id, GREATEST(calculated_total, 0), now()::TIMESTAMP WITH TIME ZONE;
END;
$$;

-- FUNCTION TO RECORD NEW TRANSACTIONS AND UPDATE SCORES
CREATE OR REPLACE FUNCTION public.record_fave_transaction(
  p_user_id UUID,
  p_delta INTEGER,
  p_reason TEXT,
  p_context_type TEXT DEFAULT NULL,
  p_context_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  transaction_id UUID,
  new_total_score INTEGER,
  achievements_unlocked JSONB[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_transaction_id UUID;
  recalc_result RECORD;
  achieved_anything JSONB[] := ARRAY[]::JSONB[];
BEGIN
  -- Insert the transaction
  INSERT INTO public.fave_transactions (user_id, delta, reason, context_type, context_id, metadata)
  VALUES (p_user_id, p_delta, p_reason, p_context_type, p_context_id, p_metadata)
  RETURNING id INTO new_transaction_id;

  -- Recalculate score
  SELECT * INTO recalc_result FROM public.recalculate_fave_score(p_user_id);

  -- Check for achievement unlocks
  SELECT array_agg(jsonb_build_object(
    'achievement_id', check_and_unlock_achievements.achievement_id,
    'title', check_and_unlock_achievements.title,
    'category', check_and_unlock_achievements.category
  ))
  INTO achieved_anything
  FROM public.check_and_unlock_achievements(p_user_id);

  RETURN QUERY
  SELECT new_transaction_id, recalc_result.total_score::INTEGER, achieved_anything;
END;
$$;

-- FUNCTION TO CHECK ACHIEVEMENT UNLOCKS
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements(target_user_id UUID)
RETURNS SETOF JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  user_score INTEGER := 0;
  user_donations_total INTEGER := 0;
  user_events_count INTEGER := 0;
  user_collaborations_count INTEGER := 0;
  achievement_unlocked BOOLEAN := FALSE;
  result_data JSONB;
BEGIN
  -- Get user stats
  SELECT COALESCE(total_score, 0) INTO user_score FROM fave_scores WHERE user_id = target_user_id;

  -- Calculate donations total
  SELECT COALESCE(SUM(amount), 0) INTO user_donations_total
  FROM donations WHERE donor_user_id = target_user_id AND status = 'succeeded';

  -- Calculate events attended
  SELECT COUNT(DISTINCT event_id) INTO user_events_count
  FROM event_registrations WHERE user_id = target_user_id AND status = 'confirmed';

  -- Calculate collaborations (simplified - projects with multiple participants)
  SELECT COUNT(DISTINCT p.id) INTO user_collaborations_count
  FROM projects p
  JOIN project_participants pp ON p.id = pp.project_id
  WHERE pp.participant_id IN (
    SELECT id FROM participants WHERE auth_user_id = target_user_id
  ) AND p.status = 'completed';

  -- Check each achievement
  FOR achievement_record IN
    SELECT * FROM achievement_definitions WHERE is_active = true
  LOOP
    achievement_unlocked := FALSE;

    CASE
      -- Score-based achievements
      WHEN achievement_record.category = 'score' THEN
        IF achievement_record.criteria->>'min_score' IS NOT NULL THEN
          achievement_unlocked := user_score >= (achievement_record.criteria->>'min_score')::INTEGER;
        END IF;

      -- Donation-based achievements
      WHEN achievement_record.category = 'donation' THEN
        IF achievement_record.criteria->>'donation_count' IS NOT NULL THEN
          achievement_unlocked := (SELECT COUNT(*) >= (achievement_record.criteria->>'donation_count')::INTEGER
                                   FROM donations WHERE donor_user_id = target_user_id AND status = 'succeeded');
        ELSIF achievement_record.criteria->>'total_donated' IS NOT NULL THEN
          achievement_unlocked := user_donations_total >= (achievement_record.criteria->>'total_donated')::INTEGER;
        END IF;

      -- Event-based achievements
      WHEN achievement_record.category = 'events' THEN
        IF achievement_record.criteria->>'events_attended' IS NOT NULL THEN
          achievement_unlocked := user_events_count >= (achievement_record.criteria->>'events_attended')::INTEGER;
        END IF;

      -- Collaboration-based achievements
      WHEN achievement_record.category = 'collaboration' THEN
        IF achievement_record.criteria->>'collaborations_completed' IS NOT NULL THEN
          achievement_unlocked := user_collaborations_count >= (achievement_record.criteria->>'collaborations_completed')::INTEGER;
        END IF;
    END CASE;

    -- If achievement should be unlocked and isn't already, unlock it
    IF achievement_unlocked AND NOT EXISTS (
      SELECT 1 FROM user_achievement_unlocks
      WHERE user_id = target_user_id AND achievement_id = achievement_record.id
    ) THEN
      INSERT INTO user_achievement_unlocks (user_id, achievement_id, unlocked_at, progress_value)
      VALUES (target_user_id, achievement_record.id, now(), user_score);

      SELECT jsonb_build_object(
        'achievement_id', achievement_record.id,
        'title', achievement_record.title,
        'category', achievement_record.category,
        'unlocked_at', now(),
        'new_unlock', true
      ) INTO result_data;

      RETURN NEXT result_data;
    END IF;
  END LOOP;

  RETURN;
END;
$$;

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '🎉 Reputation system setup complete!';
  RAISE NOTICE '📊 Tables created: fave_transactions, achievement_definitions, user_achievement_unlocks';
  RAISE NOTICE '🏆 Default achievements loaded: 10 achievement definitions';
  RAISE NOTICE '🔧 Functions available: record_fave_transaction(), check_and_unlock_achievements(), recalculate_fave_score()';
  RAISE NOTICE '✅ Components ready: FaveScoreBadge, ScoreHistory, AchievementGrid, EnhancedUserScore';
END $$;
