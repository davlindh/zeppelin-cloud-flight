-- Phase 1: Critical Database Fixes

-- 1.1: Fix service_reviews schema - rename columns to match code expectations
ALTER TABLE service_reviews 
  RENAME COLUMN client_name TO customer_name;

ALTER TABLE service_reviews 
  RENAME COLUMN client_email TO customer_email;

-- Update index if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_service_reviews_client_email'
  ) THEN
    ALTER INDEX idx_service_reviews_client_email 
      RENAME TO idx_service_reviews_customer_email;
  END IF;
END $$;

-- 1.2: Add created_by_guest column to communication_requests
ALTER TABLE communication_requests
ADD COLUMN IF NOT EXISTS created_by_guest BOOLEAN DEFAULT false;

-- Add index for filtering guest messages
CREATE INDEX IF NOT EXISTS idx_communication_requests_guest 
  ON communication_requests(created_by_guest) 
  WHERE created_by_guest = true;

-- 1.3: Data integrity checks and fixes for provider_id
-- Log services without valid provider_id
DO $$ 
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM services 
  WHERE provider_id IS NULL;
  
  IF invalid_count > 0 THEN
    RAISE NOTICE 'Found % services without valid provider_id', invalid_count;
  END IF;
END $$;

-- Add comment to document the requirement
COMMENT ON COLUMN services.provider_id IS 'Required: UUID reference to service_providers table. Services without valid provider_id should be fixed or removed.';