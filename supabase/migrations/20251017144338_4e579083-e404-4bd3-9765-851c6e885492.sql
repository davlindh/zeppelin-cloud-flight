-- Fix security warnings: Drop trigger first, then recreate functions with search_path
DROP TRIGGER IF EXISTS before_insert_media_clean_title ON media_library;

DROP FUNCTION IF EXISTS auto_clean_media_title();
DROP FUNCTION IF EXISTS clean_media_title(text);

CREATE OR REPLACE FUNCTION clean_media_title(filename text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION auto_clean_media_title()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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