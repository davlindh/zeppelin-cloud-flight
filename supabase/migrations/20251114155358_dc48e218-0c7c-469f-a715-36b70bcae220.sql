-- Phase 1: Add foreign key constraint and data migration for services-providers relationship (Complete Fix)

-- Step 1: First, migrate existing data - link services to providers by name
UPDATE services 
SET provider_id = (
  SELECT id FROM service_providers 
  WHERE service_providers.name = services.provider
  LIMIT 1
)
WHERE provider_id IS NULL 
AND provider IS NOT NULL
AND EXISTS (SELECT 1 FROM service_providers WHERE service_providers.name = services.provider);

-- Step 2: Create missing providers for services that don't have a matching provider
-- Generate slug from provider name
INSERT INTO service_providers (name, slug, avatar, email, phone, location, bio, rating, reviews, experience)
SELECT DISTINCT 
  s.provider as name,
  lower(regexp_replace(s.provider, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(md5(s.provider) for 8) as slug,
  '' as avatar,
  '' as email,
  '' as phone,
  s.location,
  'Auto-created provider profile. Please update contact information.' as bio,
  COALESCE(s.provider_rating, 4.5) as rating,
  0 as reviews,
  '5+ years' as experience
FROM services s
WHERE s.provider_id IS NULL
AND s.provider IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM service_providers sp WHERE sp.name = s.provider)
ON CONFLICT DO NOTHING;

-- Step 3: Link the newly created providers to their services
UPDATE services s
SET provider_id = sp.id
FROM service_providers sp
WHERE s.provider = sp.name
AND s.provider_id IS NULL
AND s.provider IS NOT NULL;

-- Step 4: Add index for performance before adding foreign key
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);

-- Step 5: Add foreign key constraint
ALTER TABLE services
DROP CONSTRAINT IF EXISTS fk_services_provider;

ALTER TABLE services
ADD CONSTRAINT fk_services_provider
FOREIGN KEY (provider_id) 
REFERENCES service_providers(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 6: Add index on service_providers for reverse lookups
CREATE INDEX IF NOT EXISTS idx_service_providers_name ON service_providers(name);

-- Step 7: Comment for documentation
COMMENT ON CONSTRAINT fk_services_provider ON services IS 'Links services to their provider. ON DELETE SET NULL allows provider deletion but orphans services.';
