-- Fix 1: Korrigera type baserat på mime_type
UPDATE media_library
SET type = CASE
  WHEN mime_type LIKE 'image/%' THEN 'image'
  WHEN mime_type LIKE 'video/%' THEN 'video'
  WHEN mime_type LIKE 'audio/%' THEN 'audio'
  ELSE 'document'
END
WHERE type != CASE
  WHEN mime_type LIKE 'image/%' THEN 'image'
  WHEN mime_type LIKE 'video/%' THEN 'video'
  WHEN mime_type LIKE 'audio/%' THEN 'audio'
  ELSE 'document'
END;

-- Fix 2: Generate smart titles från filename
UPDATE media_library
SET title = CASE
  WHEN title ~ '^file_[0-9]+$' AND original_filename IS NOT NULL THEN 
    initcap(
      regexp_replace(
        regexp_replace(
          regexp_replace(original_filename, '\.[^.]+$', ''),
          '[_-]', ' ', 'g'
        ),
        '[0-9]{13,}-[a-z0-9]+$', '', 'g'
      )
    )
  ELSE title
END
WHERE title ~ '^file_[0-9]+$' AND original_filename IS NOT NULL;

-- Fix 3: Create function to clean generic titles
CREATE OR REPLACE FUNCTION clean_media_title(filename text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN initcap(
    trim(
      regexp_replace(
        regexp_replace(
          regexp_replace(filename, '\.[^.]+$', ''),
          '[_-]', ' ', 'g'
        ),
        '[0-9]{13,}-[a-z0-9]+', '', 'g'
      )
    )
  );
END;
$$;

-- Fix 4: Add trigger to auto-clean titles on insert
CREATE OR REPLACE FUNCTION auto_clean_media_title()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.title ~ '^file_[0-9]+$' AND NEW.original_filename IS NOT NULL THEN
    NEW.title := clean_media_title(NEW.original_filename);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_media_clean_title
  BEFORE INSERT ON media_library
  FOR EACH ROW
  EXECUTE FUNCTION auto_clean_media_title();