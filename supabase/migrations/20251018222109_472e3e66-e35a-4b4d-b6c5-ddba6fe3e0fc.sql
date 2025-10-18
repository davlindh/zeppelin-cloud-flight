-- Phase 1: Database Security & Claim Functionality

-- 1. Fix users table RLS policy (change public to authenticated)
DROP POLICY IF EXISTS "Public can read users" ON public.users;
CREATE POLICY "Authenticated users can read users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- 2. Create participant_claim_audit table for tracking claims
CREATE TABLE IF NOT EXISTS public.participant_claim_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  claimed_by_user_id UUID NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  claim_method TEXT NOT NULL DEFAULT 'email_match',
  admin_assisted BOOLEAN NOT NULL DEFAULT false,
  admin_user_id UUID,
  notes TEXT
);

ALTER TABLE public.participant_claim_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view claim audit"
ON public.participant_claim_audit
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Create helper function to check if user can claim a participant
CREATE OR REPLACE FUNCTION public.can_claim_participant(_participant_id UUID, _user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.participants
    WHERE id = _participant_id
    AND contact_email = _user_email
    AND auth_user_id IS NULL
  )
$$;

-- 4. Create function to claim a participant profile
CREATE OR REPLACE FUNCTION public.claim_participant_profile(
  _participant_id UUID,
  _user_id UUID,
  _user_email TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_can_claim BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if user can claim this profile
  v_can_claim := public.can_claim_participant(_participant_id, _user_email);
  
  IF NOT v_can_claim THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Du kan inte göra anspråk på denna profil. E-postadressen matchar inte eller profilen är redan länkad.'
    );
  END IF;
  
  -- Update participant with auth_user_id
  UPDATE public.participants
  SET 
    auth_user_id = _user_id,
    updated_at = now()
  WHERE id = _participant_id;
  
  -- Log the claim in audit table
  INSERT INTO public.participant_claim_audit (
    participant_id,
    claimed_by_user_id,
    claim_method,
    admin_assisted
  ) VALUES (
    _participant_id,
    _user_id,
    'email_match',
    false
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Profilen har länkats till ditt konto!'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Ett fel uppstod: ' || SQLERRM
    );
END;
$$;