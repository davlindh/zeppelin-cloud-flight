
-- Drop the duplicate foreign key constraint created in previous migration
ALTER TABLE services DROP CONSTRAINT IF EXISTS fk_services_provider;

-- The existing services_provider_id_fkey constraint is correct and should remain
