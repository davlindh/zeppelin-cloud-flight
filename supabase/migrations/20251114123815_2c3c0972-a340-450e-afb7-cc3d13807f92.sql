-- Phase 4: Add slug to service_providers for public portfolio pages

-- Add slug column to service_providers
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs from names for existing providers
UPDATE service_providers
SET slug = lower(
  regexp_replace(
    regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Make slug unique and not null after population
ALTER TABLE service_providers
ADD CONSTRAINT service_providers_slug_unique UNIQUE (slug);

ALTER TABLE service_providers
ALTER COLUMN slug SET NOT NULL;

-- Add index for slug lookups
CREATE INDEX IF NOT EXISTS idx_service_providers_slug ON service_providers(slug);

-- Add columns for portfolio page customization
ALTER TABLE service_providers
ADD COLUMN IF NOT EXISTS portfolio_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS portfolio_description TEXT,
ADD COLUMN IF NOT EXISTS work_philosophy TEXT,
ADD COLUMN IF NOT EXISTS awards TEXT[],
ADD COLUMN IF NOT EXISTS years_in_business INTEGER;

COMMENT ON COLUMN service_providers.slug IS 'URL-friendly slug for provider portfolio pages';
COMMENT ON COLUMN service_providers.portfolio_visible IS 'Whether the provider portfolio page is publicly visible';
COMMENT ON COLUMN service_providers.portfolio_description IS 'Custom description for portfolio page';
COMMENT ON COLUMN service_providers.work_philosophy IS 'Provider work philosophy statement';
COMMENT ON COLUMN service_providers.awards IS 'List of awards and recognitions';
COMMENT ON COLUMN service_providers.years_in_business IS 'Number of years in business';