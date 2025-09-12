-- Fix search path security warnings for functions

-- Update generate_session_id function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_session_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN 'sess_' || encode(gen_random_bytes(16), 'hex');
END;
$$;

-- Update hash_device_fingerprint function with proper search_path  
CREATE OR REPLACE FUNCTION public.hash_device_fingerprint(fingerprint TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN encode(digest(fingerprint, 'sha256'), 'hex');
END;
$$;