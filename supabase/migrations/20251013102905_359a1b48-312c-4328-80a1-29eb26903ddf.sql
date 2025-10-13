-- ================================================================
-- 1. USERS TABELL (marketplace kunder/användare)
-- ================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  location TEXT,
  bio TEXT,
  email_verified BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  customer_id INTEGER,
  address TEXT,
  company_name TEXT,
  vat_number TEXT,
  customer_type TEXT DEFAULT 'individual',
  preferred_contact_method TEXT DEFAULT 'email',
  preferred_payment_method TEXT,
  loyalty_points INTEGER DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies för users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" 
  ON public.users
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" 
  ON public.users
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage all users" 
  ON public.users
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger för updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    full_name,
    phone,
    email_verified
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 2. NOTIFICATION_PREFERENCES TABELL
-- ================================================================
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  price_drop_alerts BOOLEAN DEFAULT true,
  stock_alerts BOOLEAN DEFAULT true,
  back_in_stock_alerts BOOLEAN DEFAULT true,
  auction_ending_alerts BOOLEAN DEFAULT true,
  outbid_alerts BOOLEAN DEFAULT true,
  new_items_in_categories BOOLEAN DEFAULT false,
  daily_digest BOOLEAN DEFAULT false,
  weekly_recommendations BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '08:00',
  frequency_immediate BOOLEAN DEFAULT true,
  frequency_hourly BOOLEAN DEFAULT false,
  frequency_daily BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences" 
  ON public.notification_preferences
  FOR ALL 
  USING (user_id::text = auth.uid()::text);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 3. BID_NOTIFICATIONS TABELL
-- ================================================================
CREATE TABLE public.bid_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bid_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bid notifications" 
  ON public.bid_notifications
  FOR SELECT 
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own bid notifications" 
  ON public.bid_notifications
  FOR UPDATE 
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "System can create bid notifications" 
  ON public.bid_notifications
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can manage all notifications" 
  ON public.bid_notifications
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ================================================================
-- 4. GET_AVAILABLE_TIMES RPC FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION public.get_available_times(
  service_uuid UUID,
  selected_date TEXT
)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  service_times TEXT[];
  booked_times TEXT[];
  available_times TEXT[];
BEGIN
  SELECT available_times INTO service_times
  FROM public.services
  WHERE id = service_uuid;

  SELECT ARRAY_AGG(selected_time) INTO booked_times
  FROM public.bookings
  WHERE service_id = service_uuid
    AND selected_date = get_available_times.selected_date
    AND status != 'cancelled';

  IF booked_times IS NULL THEN
    RETURN service_times;
  ELSE
    SELECT ARRAY_AGG(t) INTO available_times
    FROM UNNEST(service_times) AS t
    WHERE t != ALL(booked_times);
    
    RETURN COALESCE(available_times, ARRAY[]::TEXT[]);
  END IF;
END;
$$;