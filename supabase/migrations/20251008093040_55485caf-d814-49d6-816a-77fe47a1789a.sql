-- 1. Skapa participant_tokens tabell
CREATE TABLE public.participant_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_participant_tokens_token ON public.participant_tokens(token) WHERE used_at IS NULL;
CREATE INDEX idx_participant_tokens_participant ON public.participant_tokens(participant_id);
CREATE INDEX idx_participant_tokens_expires ON public.participant_tokens(expires_at) WHERE used_at IS NULL;

ALTER TABLE public.participant_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read tokens" ON public.participant_tokens
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Lägg till profile_completed i participants
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_contact_info BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 3. RPC: verify_participant_token
CREATE OR REPLACE FUNCTION public.verify_participant_token(_token UUID)
RETURNS TABLE(
  valid BOOLEAN,
  participant_id UUID,
  participant_email TEXT,
  participant_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token RECORD;
BEGIN
  SELECT 
    pt.participant_id,
    p.contact_email,
    p.name,
    pt.expires_at,
    pt.used_at
  INTO v_token
  FROM participant_tokens pt
  INNER JOIN participants p ON p.id = pt.participant_id
  WHERE pt.token = _token;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  IF v_token.expires_at < now() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  IF v_token.used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT 
    true, 
    v_token.participant_id, 
    v_token.contact_email, 
    v_token.name;
END;
$$;

-- 4. RPC: complete_participant_profile
CREATE OR REPLACE FUNCTION public.complete_participant_profile(
  _token UUID,
  _auth_user_id UUID,
  _bio TEXT DEFAULT NULL,
  _skills TEXT[] DEFAULT NULL,
  _experience_level TEXT DEFAULT NULL,
  _interests TEXT[] DEFAULT NULL,
  _time_commitment TEXT DEFAULT NULL,
  _contributions TEXT[] DEFAULT NULL,
  _availability TEXT DEFAULT NULL,
  _avatar_path TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, participant_slug TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participant_id UUID;
  v_slug TEXT;
BEGIN
  SELECT pt.participant_id INTO v_participant_id
  FROM participant_tokens pt
  WHERE pt.token = _token
    AND pt.expires_at > now()
    AND pt.used_at IS NULL;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid or expired token'::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  UPDATE participants
  SET
    auth_user_id = _auth_user_id,
    bio = COALESCE(_bio, bio),
    skills = COALESCE(_skills, skills),
    experience_level = COALESCE(_experience_level, experience_level),
    interests = COALESCE(_interests, interests),
    time_commitment = COALESCE(_time_commitment, time_commitment),
    contributions = COALESCE(_contributions, contributions),
    availability = COALESCE(_availability, availability),
    avatar_path = COALESCE(_avatar_path, avatar_path),
    profile_completed = true,
    profile_completed_at = now(),
    updated_at = now()
  WHERE id = v_participant_id
  RETURNING slug INTO v_slug;

  UPDATE participant_tokens
  SET used_at = now()
  WHERE token = _token;

  RETURN QUERY SELECT true, 'Profile completed successfully'::TEXT, v_slug;
END;
$$;

-- 5. RPC: create_participant_from_submission
CREATE OR REPLACE FUNCTION public.create_participant_from_submission(
  _submission_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  participant_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_submission RECORD;
  v_participant_id UUID;
  v_slug TEXT;
BEGIN
  SELECT * INTO v_submission FROM submissions WHERE id = _submission_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Submission not found'::TEXT;
    RETURN;
  END IF;

  IF v_submission.type <> 'participant' THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Not a participant submission'::TEXT;
    RETURN;
  END IF;

  v_slug := generate_slug(COALESCE(v_submission.content->>'name', v_submission.title));

  INSERT INTO participants (
    name,
    slug,
    bio,
    contact_email,
    contact_phone,
    location,
    skills,
    experience_level,
    interests,
    time_commitment,
    contributions,
    how_found_us,
    availability,
    profile_completed,
    is_public
  ) VALUES (
    COALESCE(v_submission.content->>'name', v_submission.title),
    v_slug,
    v_submission.content->>'bio',
    COALESCE(v_submission.contact_email, v_submission.content->>'email'),
    COALESCE(v_submission.contact_phone, v_submission.content->>'phone'),
    COALESCE(v_submission.location, v_submission.content->>'location'),
    CASE 
      WHEN v_submission.content->'skills' IS NOT NULL 
      THEN (SELECT array_agg(value::TEXT) FROM jsonb_array_elements_text(v_submission.content->'skills'))
      ELSE NULL
    END,
    v_submission.content->>'experienceLevel',
    CASE 
      WHEN v_submission.content->'interests' IS NOT NULL 
      THEN (SELECT array_agg(value::TEXT) FROM jsonb_array_elements_text(v_submission.content->'interests'))
      ELSE NULL
    END,
    v_submission.content->>'timeCommitment',
    CASE 
      WHEN v_submission.content->'contributions' IS NOT NULL 
      THEN (SELECT array_agg(value::TEXT) FROM jsonb_array_elements_text(v_submission.content->'contributions'))
      ELSE NULL
    END,
    v_submission.how_found_us,
    v_submission.content->>'availability',
    false,
    true
  )
  RETURNING id INTO v_participant_id;

  RETURN QUERY SELECT true, v_participant_id, 'Participant created successfully'::TEXT;
END;
$$;