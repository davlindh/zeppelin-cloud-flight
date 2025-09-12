-- Add slug field to projects table
ALTER TABLE public.projects ADD COLUMN slug text;

-- Create unique index on slug for fast lookups and ensure uniqueness
CREATE UNIQUE INDEX idx_projects_slug ON public.projects(slug);

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Convert title to slug: lowercase, replace spaces and special chars with hyphens
  base_slug := lower(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'projekt';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for duplicates and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.projects WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Update existing projects with generated slugs
UPDATE public.projects 
SET slug = public.generate_slug(title) 
WHERE slug IS NULL;

-- Make slug NOT NULL after populating existing records
ALTER TABLE public.projects ALTER COLUMN slug SET NOT NULL;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only generate slug if it's not provided or title changed
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.title != NEW.title AND NEW.slug = OLD.slug) THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER projects_auto_slug
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_slug();