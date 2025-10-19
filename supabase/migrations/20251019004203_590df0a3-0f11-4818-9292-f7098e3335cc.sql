-- Add media_status and processed_at columns to submissions table
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS media_status TEXT DEFAULT 'pending' CHECK (media_status IN ('pending', 'converted', 'rejected')),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying of pending media submissions
CREATE INDEX IF NOT EXISTS idx_submissions_media_status ON public.submissions(media_status) WHERE media_status = 'pending';

-- Create function to convert submission media to media library
CREATE OR REPLACE FUNCTION public.convert_submission_media_to_library(
  submission_id UUID,
  media_urls TEXT[],
  target_project_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  submission_record RECORD;
  media_url TEXT;
  file_extension TEXT;
  file_name TEXT;
  project_id UUID;
  media_type TEXT;
  media_id UUID;
  converted_count INTEGER := 0;
BEGIN
  -- Get submission details
  SELECT * INTO submission_record
  FROM submissions
  WHERE id = submission_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Submission not found'
    );
  END IF;

  -- Use provided project_id or get it from submission
  project_id := COALESCE(
    target_project_id,
    (submission_record.content->>'project_id')::UUID
  );

  -- Process each media URL
  FOREACH media_url IN ARRAY media_urls
  LOOP
    -- Extract file extension and name from URL
    file_name := split_part(media_url, '/', -1);
    file_extension := lower(split_part(file_name, '.', -1));

    -- Map file extension to media type
    media_type := CASE
      WHEN file_extension IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico') THEN 'image'
      WHEN file_extension IN ('mp4', 'avi', 'mov', 'wmv', 'webm', 'mkv', 'flv') THEN 'video'
      WHEN file_extension IN ('mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma') THEN 'audio'
      WHEN file_extension IN ('pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx') THEN 'document'
      ELSE 'document'
    END;

    -- Create media record in media_library table
    INSERT INTO media_library (
      type,
      filename,
      original_filename,
      title,
      description,
      public_url,
      storage_path,
      mime_type,
      status,
      source,
      submission_id,
      uploaded_by,
      bucket,
      is_public
    ) VALUES (
      media_type,
      file_name,
      file_name,
      COALESCE(submission_record.title, clean_media_title(file_name)),
      'Imported from submission: ' || submission_record.title,
      media_url,
      media_url, -- Storage path same as URL for now
      'application/octet-stream', -- Will be updated by client if needed
      'approved', -- Auto-approve imported media
      'submission',
      submission_id,
      submission_record.contact_email,
      'media-files',
      true
    )
    RETURNING id INTO media_id;

    -- If project_id is provided, create link
    IF project_id IS NOT NULL THEN
      INSERT INTO media_project_links (media_id, project_id)
      VALUES (media_id, project_id)
      ON CONFLICT DO NOTHING;
    END IF;

    converted_count := converted_count + 1;
  END LOOP;

  -- Update submission status
  UPDATE submissions
  SET
    media_status = 'converted',
    processed_at = NOW()
  WHERE id = submission_id;

  -- Return success result
  RETURN json_build_object(
    'success', true,
    'converted_count', converted_count,
    'project_id', project_id,
    'message', format('Successfully converted %s media files', converted_count)
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Update submission to indicate conversion failed
    UPDATE submissions
    SET
      media_status = 'rejected',
      processed_at = NOW()
    WHERE id = submission_id;

    -- Return error result
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to convert media files'
    );
END;
$$;

COMMENT ON FUNCTION public.convert_submission_media_to_library IS 'Converts media files from submissions to media_library entries and optionally links them to projects';