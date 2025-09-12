-- Update admin emails and create settings system

-- Replace old admin email with new ones
DELETE FROM public.admin_users WHERE email = 'admin@zeppelinn.se';
INSERT INTO public.admin_users (email) VALUES 
  ('lindhdavid2@gmail.com'),
  ('artzebs@gmail.com');

-- Create admin settings table for configuration toggles
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_settings
CREATE POLICY "Admins can manage admin_settings" ON public.admin_settings FOR ALL USING (public.is_admin(current_setting('request.jwt.claims', true)::json->>'email'));
CREATE POLICY "Public can read admin_settings" ON public.admin_settings FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES 
  ('use_database_partners', '{"enabled": false}', 'Toggle between database and static partner data'),
  ('partner_display_mode', '{"mode": "static"}', 'Current partner data source mode');

-- Create trigger for updating timestamps
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Populate sponsors table with existing static partner data if not already present
INSERT INTO public.sponsors (name, type, logo_path, website) VALUES 
  ('Stenbräcka Kursgård', 'partner', 'partners/stenbracka-logo.png', 'https://stenbracka.se/'),
  ('Maskin & Fritid', 'partner', 'partners/maskin-fritid-logo.png', 'https://www.maskfri.se/'),
  ('Karlskrona Kommun', 'main', 'partners/karlskrona-kommun-logo.png', 'https://www.karlskrona.se/'),
  ('Visit Blekinge', 'supporter', 'partners/visit-blekinge-logo.png', 'https://www.visitblekinge.se/')
ON CONFLICT DO NOTHING;