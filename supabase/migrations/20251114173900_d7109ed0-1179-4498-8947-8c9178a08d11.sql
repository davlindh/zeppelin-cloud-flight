-- Add auth_user_id to service_providers table
ALTER TABLE service_providers 
ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_service_providers_auth_user ON service_providers(auth_user_id);

-- Add RLS policy for providers to edit their own profile
CREATE POLICY "Providers can edit own profile"
ON service_providers FOR UPDATE
USING (auth_user_id = auth.uid() AND has_role(auth.uid(), 'provider'::app_role))
WITH CHECK (auth_user_id = auth.uid());

-- Add RLS policy for providers to view their own profile
CREATE POLICY "Providers can view own profile"
ON service_providers FOR SELECT
USING (auth_user_id = auth.uid() AND has_role(auth.uid(), 'provider'::app_role));