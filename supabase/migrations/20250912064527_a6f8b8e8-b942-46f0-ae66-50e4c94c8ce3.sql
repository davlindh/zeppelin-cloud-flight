-- Enhanced submissions table structure (fix constraint issue)
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'sv',
ADD COLUMN IF NOT EXISTS how_found_us TEXT,
ADD COLUMN IF NOT EXISTS publication_permission BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_type ON public.submissions(type);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_contact_email ON public.submissions(contact_email);

-- Drop existing constraint if it exists and recreate with updated values
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_type_check;
ALTER TABLE public.submissions 
ADD CONSTRAINT submissions_type_check 
CHECK (type IN ('project', 'media', 'participant', 'feedback', 'suggestion', 'collaboration'));

-- Create a function to validate submission content based on type
CREATE OR REPLACE FUNCTION validate_submission_content()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for content validation
DROP TRIGGER IF EXISTS validate_submission_content_trigger ON public.submissions;
CREATE TRIGGER validate_submission_content_trigger
  BEFORE INSERT OR UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION validate_submission_content();