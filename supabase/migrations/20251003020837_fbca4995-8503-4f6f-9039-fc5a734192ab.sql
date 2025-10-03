-- Add media approval and conversion tracking to submissions
-- This will help track which media files from submissions have been processed

-- Add columns to track media processing status
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS media_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS media_converted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS media_status TEXT DEFAULT 'pending' CHECK (media_status IN ('pending', 'approved', 'rejected', 'converted'));

-- Add index for better performance on media status queries
CREATE INDEX IF NOT EXISTS idx_submissions_media_status ON public.submissions(media_status);
CREATE INDEX IF NOT EXISTS idx_submissions_media_approved ON public.submissions(media_approved_at) WHERE media_approved_at IS NOT NULL;

-- Create function to automatically convert approved media to media_items table
CREATE OR REPLACE FUNCTION public.convert_submission_media_to_library(
  submission_id UUID,
  media_urls TEXT[]
) RETURNS TABLE(created_media_id UUID, media_url TEXT) AS $$
DECLARE
  submission_record RECORD;
  file_record JSONB;
  media_id UUID;
  media_url TEXT;
  media_type TEXT;
  category TEXT;
BEGIN
  -- Get the submission details
  SELECT * INTO submission_record FROM public.submissions WHERE id = submission_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found with id: %', submission_id;
  END IF;
  
  -- Determine category based on submission type
  category := CASE 
    WHEN submission_record.type = 'participant' THEN 'portfolio'
    WHEN submission_record.type = 'project' THEN 'featured'
    WHEN submission_record.type = 'media' THEN 'promotional'
    ELSE 'general'
  END;
  
  -- Process each media URL
  FOREACH media_url IN ARRAY media_urls LOOP
    -- Generate new UUID for media item
    media_id := gen_random_uuid();
    
    -- Determine media type from URL/content (simplified)
    IF media_url ~* '\.(jpg|jpeg|png|gif|webp)(\?.*)?$' THEN
      media_type := 'image/jpeg';
    ELSIF media_url ~* '\.(mp4|avi|mov|wmv)(\?.*)?$' THEN
      media_type := 'video/mp4';
    ELSIF media_url ~* '\.(mp3|wav|ogg)(\?.*)?$' THEN
      media_type := 'audio/mpeg';
    ELSE
      media_type := 'application/octet-stream';
    END IF;
    
    -- Insert into media_items table
    INSERT INTO public.media_items (
      id,
      url,
      filename,
      original_name,
      mime_type,
      category,
      is_public,
      created_by,
      project_id,
      participant_id,
      metadata
    ) VALUES (
      media_id,
      media_url,
      COALESCE(split_part(media_url, '/', -1), 'unknown'),
      submission_record.title,
      media_type,
      category,
      true,
      submission_record.submitted_by,
      CASE WHEN submission_record.type = 'project' THEN submission_record.id ELSE NULL END,
      CASE WHEN submission_record.type = 'participant' THEN submission_record.id ELSE NULL END,
      jsonb_build_object(
        'source', 'submission',
        'submission_id', submission_record.id,
        'submission_type', submission_record.type,
        'converted_at', NOW()
      )
    );
    
    -- Return the created media item info
    created_media_id := media_id;
    RETURN NEXT;
  END LOOP;
  
  -- Update submission to mark media as converted
  UPDATE public.submissions 
  SET 
    media_status = 'converted',
    media_converted_at = NOW()
  WHERE id = submission_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;