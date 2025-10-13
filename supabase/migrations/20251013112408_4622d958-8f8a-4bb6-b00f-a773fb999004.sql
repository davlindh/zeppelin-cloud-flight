-- Fix last Function Search Path Mutable warning

-- Fix convert_submission_media_to_library
CREATE OR REPLACE FUNCTION public.convert_submission_media_to_library(submission_id uuid, media_urls text[], target_project_id uuid DEFAULT NULL::uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  submission_record RECORD;
  media_url TEXT;
  file_extension TEXT;
  file_name TEXT;
  project_id UUID;
  media_type TEXT;
  converted_count INTEGER := 0;
BEGIN
  -- Get submission details
  SELECT * INTO submission_record
  FROM submissions
  WHERE id = submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Use provided project_id or get it from submission or generate new one
  project_id := COALESCE(
    target_project_id,
    (submission_record.content->>'project_id')::UUID,
    gen_random_uuid()
  );

  -- Process each media URL
  FOREACH media_url IN ARRAY media_urls
  LOOP
    -- Extract file extension and name from URL
    file_name := split_part(media_url, '/', -1);
    file_extension := split_part(file_name, '.', -1);

    -- Map file extension to media type
    media_type := CASE
      WHEN file_extension IN ('jpg', 'jpeg', 'png', 'gif', 'webp') THEN 'image'
      WHEN file_extension IN ('mp4', 'avi', 'mov', 'wmv', 'webm') THEN 'video'
      WHEN file_extension IN ('mp3', 'wav', 'ogg', 'aac') THEN 'audio'
      ELSE 'document'
    END;

    -- Create media record in project_media table
    INSERT INTO project_media (
      project_id,
      type,
      url,
      title,
      description
    ) VALUES (
      project_id,
      media_type,
      media_url,
      file_name,
      'Converted from submission: ' || submission_record.title
    )
    ON CONFLICT DO NOTHING;

    IF FOUND THEN
      converted_count := converted_count + 1;
    END IF;
  END LOOP;

  -- Update submission status to indicate conversion is complete
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
$function$;