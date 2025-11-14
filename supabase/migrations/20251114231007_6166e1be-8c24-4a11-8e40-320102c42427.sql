-- Extend services table for marketplace features
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pricing_model text DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS hourly_rate numeric,
  ADD COLUMN IF NOT EXISTS project_rate_min numeric,
  ADD COLUMN IF NOT EXISTS project_rate_max numeric,
  ADD COLUMN IF NOT EXISTS event_availability jsonb DEFAULT '[]';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_tags ON services USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_services_event_availability ON services USING GIN(event_availability);
CREATE INDEX IF NOT EXISTS idx_services_pricing_model ON services(pricing_model);

-- Extend bookings table for enhanced workflow
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider_notes text,
  ADD COLUMN IF NOT EXISTS proposed_times jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS provider_response text;

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);

-- Add new booking statuses
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
  END IF;
END $$;

-- Add new status values if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'booking_status' AND e.enumlabel = 'request'
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'request';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'booking_status' AND e.enumlabel = 'pending_provider'
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'pending_provider';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'booking_status' AND e.enumlabel = 'rejected'
  ) THEN
    ALTER TYPE booking_status ADD VALUE 'rejected';
  END IF;
END $$;

-- Update RLS policies for bookings
DROP POLICY IF EXISTS "Users can read their own bookings" ON bookings;
CREATE POLICY "Users can read their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = user_id 
    OR customer_email = current_user_email()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Providers can view bookings for their services
DROP POLICY IF EXISTS "Providers can view their service bookings" ON bookings;
CREATE POLICY "Providers can view their service bookings"
  ON bookings FOR SELECT
  USING (
    service_id IN (
      SELECT id FROM services WHERE provider_id IN (
        SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Providers can update their service bookings
DROP POLICY IF EXISTS "Providers can update their service bookings" ON bookings;
CREATE POLICY "Providers can update their service bookings"
  ON bookings FOR UPDATE
  USING (
    service_id IN (
      SELECT id FROM services WHERE provider_id IN (
        SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Comment the new columns
COMMENT ON COLUMN services.tags IS 'Searchable tags for service categorization';
COMMENT ON COLUMN services.pricing_model IS 'Pricing model: fixed, hourly, per_project, or custom';
COMMENT ON COLUMN services.event_availability IS 'JSON array of {event_id, available, custom_price} objects';
COMMENT ON COLUMN bookings.user_id IS 'Reference to authenticated user who made the booking';
COMMENT ON COLUMN bookings.event_id IS 'Reference to event if booking is event-specific';
COMMENT ON COLUMN bookings.provider_notes IS 'Internal notes from provider';
COMMENT ON COLUMN bookings.proposed_times IS 'JSON array of {date, time, note} alternative proposals';
COMMENT ON COLUMN bookings.provider_response IS 'Provider response message for accept/reject';