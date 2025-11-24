-- Add missing columns to service_providers and sponsors tables

-- Add status column to service_providers
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add slug and status columns to sponsors
ALTER TABLE sponsors
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Generate slugs for existing sponsors without slugs
UPDATE sponsors
SET slug = lower(
  regexp_replace(
    regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Add unique constraint on sponsors slug
CREATE UNIQUE INDEX IF NOT EXISTS sponsors_slug_unique ON sponsors(slug) WHERE slug IS NOT NULL;

-- Add comment
COMMENT ON COLUMN service_providers.status IS 'Status of service provider: active, inactive, pending';
COMMENT ON COLUMN sponsors.slug IS 'URL-friendly slug for sponsor profile';
COMMENT ON COLUMN sponsors.status IS 'Status of sponsor: active, inactive, pending';