-- Function to automatically assign provider role when service_provider created
CREATE OR REPLACE FUNCTION assign_provider_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign role if auth_user_id is set and role doesn't exist
  IF NEW.auth_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.auth_user_id, 'provider'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-assign provider role
DROP TRIGGER IF EXISTS trigger_assign_provider_role ON service_providers;
CREATE TRIGGER trigger_assign_provider_role
  AFTER INSERT OR UPDATE OF auth_user_id ON service_providers
  FOR EACH ROW
  EXECUTE FUNCTION assign_provider_role();

-- Allow authenticated users to create their own provider profile
DROP POLICY IF EXISTS "Users can create own provider profile" ON service_providers;
CREATE POLICY "Users can create own provider profile"
  ON service_providers FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());