-- Add availability status to service_providers if not exists
ALTER TABLE service_providers 
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS next_available_at TIMESTAMPTZ;

-- Create service_views table for tracking service page views
CREATE TABLE IF NOT EXISTS service_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_service_views_service ON service_views(service_id);
CREATE INDEX IF NOT EXISTS idx_service_views_provider ON service_views(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_views_date ON service_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE service_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_views
CREATE POLICY "Providers can view their service views"
  ON service_views FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
    )
  );

-- Allow inserting service views (for tracking)
CREATE POLICY "Anyone can insert service views"
  ON service_views FOR INSERT
  WITH CHECK (true);