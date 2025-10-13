-- ================================================================
-- FIX MARKETPLACE STRUCTURE
-- ================================================================

-- 1. Lägg till unique constraint på categories.name om den inte finns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'categories_name_key' 
    AND conrelid = 'public.categories'::regclass
  ) THEN
    ALTER TABLE public.categories ADD CONSTRAINT categories_name_key UNIQUE (name);
  END IF;
END$$;

-- 2. Skapa user_watchlist tabell
CREATE TABLE IF NOT EXISTS public.user_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watchlist" 
  ON public.user_watchlist
  FOR ALL 
  USING (user_id::text = auth.uid()::text);

CREATE TRIGGER update_user_watchlist_updated_at
  BEFORE UPDATE ON public.user_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Skapa role_change_audit tabell
CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT
);

ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" 
  ON public.role_change_audit
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Lägg till 'participant' till app_role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'participant' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'participant';
  END IF;
END$$;

-- 5. Konvertera auctions.category till TEXT
ALTER TABLE public.auctions 
  ALTER COLUMN category TYPE TEXT;

-- 6. Konvertera services.category till TEXT
ALTER TABLE public.services 
  ALTER COLUMN category TYPE TEXT;

-- 7. Seed initial categories
INSERT INTO public.categories (name, display_name, description, is_active, sort_order) VALUES
  ('electronics', 'Elektronik', 'Elektronik och teknikprodukter', true, 1),
  ('fashion', 'Mode', 'Kläder och accessoarer', true, 2),
  ('home', 'Hem & Inredning', 'Hemprodukter och inredning', true, 3),
  ('sports', 'Sport & Fritid', 'Sportprodukter och fritidsutrustning', true, 4),
  ('books', 'Böcker', 'Böcker och media', true, 5),
  ('automotive', 'Fordon', 'Bilar, motorcyklar och fordon', true, 6),
  ('art', 'Konst', 'Konst och samlarobjekt', true, 7),
  ('collectibles', 'Samlarobjekt', 'Samlarobjekt och rariteter', true, 8),
  ('consulting', 'Konsulttjänster', 'Professionella konsulttjänster', true, 10),
  ('design', 'Design', 'Design och kreativa tjänster', true, 11),
  ('photography', 'Fotografering', 'Foto och videotjänster', true, 12),
  ('tutoring', 'Undervisning', 'Utbildning och undervisning', true, 13),
  ('fitness', 'Träning', 'Träning och hälsa', true, 14),
  ('beauty', 'Skönhet', 'Skönhetsvård och frisör', true, 15),
  ('home-services', 'Hemtjänster', 'Hemtjänster och reparation', true, 16),
  ('legal', 'Juridik', 'Juridiska tjänster', true, 17),
  ('accounting', 'Ekonomi', 'Ekonomi och bokföring', true, 18),
  ('event-planning', 'Eventplanering', 'Event och festplanering', true, 19)
ON CONFLICT (name) DO NOTHING;