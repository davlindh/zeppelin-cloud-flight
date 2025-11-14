-- View: provider_performance_metrics
-- Purpose: Aggregate booking performance, response times, ratings
CREATE OR REPLACE VIEW provider_performance_metrics AS
SELECT 
  sp.id as provider_id,
  sp.auth_user_id,
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.id END) as pending_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
  ROUND((COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100), 2) as acceptance_rate,
  sp.rating as avg_rating,
  sp.reviews as total_reviews,
  sp.response_time,
  COUNT(DISTINCT s.id) as active_services,
  COUNT(DISTINCT spi.id) as portfolio_items
FROM service_providers sp
LEFT JOIN services s ON s.provider_id = sp.id
LEFT JOIN bookings b ON b.service_id = s.id
LEFT JOIN service_portfolio_items spi ON spi.provider_id = sp.id
GROUP BY sp.id, sp.auth_user_id, sp.rating, sp.reviews, sp.response_time;

-- Table: provider_activities (for activity feed)
CREATE TABLE IF NOT EXISTS provider_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'info',
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_activities_provider ON provider_activities(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_activities_created ON provider_activities(created_at DESC);

-- Table: provider_notifications (for notification center)
CREATE TABLE IF NOT EXISTS provider_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  urgency TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_notifications_provider ON provider_notifications(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_notifications_read ON provider_notifications(read);
CREATE INDEX IF NOT EXISTS idx_provider_notifications_created ON provider_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE provider_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_activities
DROP POLICY IF EXISTS "Providers can view own activities" ON provider_activities;
CREATE POLICY "Providers can view own activities"
  ON provider_activities FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage activities" ON provider_activities;
CREATE POLICY "Admins can manage activities"
  ON provider_activities FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for provider_notifications
DROP POLICY IF EXISTS "Providers can view own notifications" ON provider_notifications;
CREATE POLICY "Providers can view own notifications"
  ON provider_notifications FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Providers can update own notifications" ON provider_notifications;
CREATE POLICY "Providers can update own notifications"
  ON provider_notifications FOR UPDATE
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage notifications" ON provider_notifications;
CREATE POLICY "Admins can manage notifications"
  ON provider_notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function: Get provider revenue stats
CREATE OR REPLACE FUNCTION get_provider_revenue_stats(p_provider_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_revenue', COALESCE(SUM(b.total_price), 0),
    'avg_booking_value', COALESCE(AVG(b.total_price), 0),
    'bookings_count', COUNT(*),
    'revenue_by_service', (
      SELECT json_agg(
        json_build_object(
          'service_name', s.title,
          'revenue', COALESCE(SUM(b.total_price), 0),
          'bookings', COUNT(*)
        )
      )
      FROM services s
      LEFT JOIN bookings b ON b.service_id = s.id 
        AND b.created_at >= NOW() - (p_days || ' days')::INTERVAL
        AND b.status IN ('confirmed', 'completed')
      WHERE s.provider_id = p_provider_id
      GROUP BY s.id, s.title
    )
  ) INTO result
  FROM services s
  INNER JOIN bookings b ON b.service_id = s.id
  WHERE s.provider_id = p_provider_id
    AND b.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND b.status IN ('confirmed', 'completed');
  
  RETURN COALESCE(result, '{"total_revenue":0,"avg_booking_value":0,"bookings_count":0,"revenue_by_service":[]}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger: Auto-create notification on new booking
CREATE OR REPLACE FUNCTION notify_provider_new_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_id UUID;
  v_service_title TEXT;
BEGIN
  SELECT s.provider_id, s.title INTO v_provider_id, v_service_title
  FROM services s
  WHERE s.id = NEW.service_id;
  
  IF v_provider_id IS NOT NULL THEN
    INSERT INTO provider_notifications (
      provider_id,
      title,
      message,
      type,
      urgency,
      action_url,
      entity_id
    ) VALUES (
      v_provider_id,
      'New Booking Request',
      'You have a new booking request for ' || v_service_title || ' from ' || NEW.customer_name,
      'booking',
      'urgent',
      '/marketplace/bookings',
      NEW.id
    );
    
    INSERT INTO provider_activities (
      provider_id,
      activity_type,
      title,
      description,
      severity,
      link,
      metadata
    ) VALUES (
      v_provider_id,
      'booking_request',
      'New booking request',
      'From ' || NEW.customer_name || ' for ' || v_service_title,
      'high',
      '/marketplace/bookings/' || NEW.id,
      jsonb_build_object('booking_id', NEW.id, 'service_id', NEW.service_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_notify_provider_new_booking ON bookings;
CREATE TRIGGER trigger_notify_provider_new_booking
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_provider_new_booking();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE provider_notifications;