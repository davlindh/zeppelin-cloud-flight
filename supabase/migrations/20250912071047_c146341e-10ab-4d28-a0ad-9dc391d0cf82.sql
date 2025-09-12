-- Fix validation function to support partnership type and add ELSE clause
CREATE OR REPLACE FUNCTION public.validate_submission_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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

-- Update the constraint to include all submission types
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_type_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_type_check 
CHECK (type IN ('project', 'participant', 'media', 'partnership', 'collaboration'));