-- Update validation trigger to be more flexible and accept new field structure
CREATE OR REPLACE FUNCTION public.validate_submission_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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