-- Fix security warning: Set search_path for function
CREATE OR REPLACE FUNCTION validate_submission_content()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Validate required fields based on submission type
  CASE NEW.type
    WHEN 'project' THEN
      -- Project submissions should have purpose, expected_impact
      IF NOT (NEW.content ? 'purpose' AND NEW.content ? 'expected_impact') THEN
        RAISE EXCEPTION 'Project submissions must include purpose and expected_impact';
      END IF;
    WHEN 'participant' THEN
      -- Participant submissions should have bio, skills
      IF NOT (NEW.content ? 'bio' AND NEW.content ? 'skills') THEN
        RAISE EXCEPTION 'Participant submissions must include bio and skills';
      END IF;
    WHEN 'media' THEN
      -- Media submissions should have media_type, category
      IF NOT (NEW.content ? 'media_type' AND NEW.content ? 'category') THEN
        RAISE EXCEPTION 'Media submissions must include media_type and category';
      END IF;
  END CASE;
  
  RETURN NEW;
END;
$$;