-- Lägg till 'moderator' till app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';

-- Skapa get_total_users_count() RPC-funktion
CREATE OR REPLACE FUNCTION public.get_total_users_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.users;
$$;

-- Lägg till alias för timestamp i admin_access_logs (använd created_at)
COMMENT ON COLUMN public.admin_access_logs.created_at IS 'Also accessible as timestamp for backwards compatibility';