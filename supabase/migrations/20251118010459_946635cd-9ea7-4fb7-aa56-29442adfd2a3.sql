-- ============================================================================
-- Smart Tickets: Functions and Invitations Layer
-- ============================================================================

-- Function: Generate ticket instances when order is confirmed
CREATE OR REPLACE FUNCTION generate_ticket_instances_for_order(p_order_id UUID)
RETURNS void AS $$
DECLARE
  v_order event_ticket_orders%ROWTYPE;
  i INTEGER;
  v_token TEXT;
BEGIN
  SELECT * INTO v_order
  FROM event_ticket_orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- Avoid double generation
  IF EXISTS (
    SELECT 1 FROM event_ticket_instances
    WHERE ticket_order_id = p_order_id
  ) THEN
    RETURN;
  END IF;

  -- Generate one instance per quantity
  FOR i IN 1..v_order.quantity LOOP
    v_token := 'ZT_' || encode(gen_random_bytes(16), 'hex');

    INSERT INTO event_ticket_instances (
      ticket_order_id,
      event_id,
      ticket_type_id,
      qr_code,
      status
    )
    VALUES (
      v_order.id,
      v_order.event_id,
      v_order.ticket_type_id,
      v_token,
      'valid'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Trigger: Auto-generate instances on order confirmation
CREATE OR REPLACE FUNCTION on_ticket_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> 'confirmed' AND NEW.status = 'confirmed' THEN
    PERFORM generate_ticket_instances_for_order(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS trg_ticket_orders_status ON event_ticket_orders;

CREATE TRIGGER trg_ticket_orders_status
AFTER UPDATE ON event_ticket_orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION on_ticket_order_status_change();

-- Function: Award Fave points for event attendance
CREATE OR REPLACE FUNCTION award_event_attendance_fave(p_user_id UUID, p_event_id UUID)
RETURNS void AS $$
DECLARE
  already_awarded BOOLEAN;
  v_points INTEGER := 25;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM fave_transactions
    WHERE user_id = p_user_id
      AND reason = 'event_attendance'
      AND context_type = 'event'
      AND context_id = p_event_id
  ) INTO already_awarded;

  IF already_awarded THEN
    RETURN;
  END IF;

  PERFORM apply_fave_transaction(
    p_user_id,
    v_points,
    'event_attendance',
    'event',
    p_event_id,
    'participation',
    jsonb_build_object(
      'source', 'ticket_check_in',
      'timestamp', now()
    )
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Function: Check in ticket by QR code
CREATE OR REPLACE FUNCTION check_in_ticket_by_qr(p_qr_code TEXT)
RETURNS jsonb AS $$
DECLARE
  v_instance event_ticket_instances%ROWTYPE;
  v_order event_ticket_orders%ROWTYPE;
  v_event events%ROWTYPE;
  v_ticket_type event_ticket_types%ROWTYPE;
BEGIN
  SELECT * INTO v_instance
  FROM event_ticket_instances
  WHERE qr_code = p_qr_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket not found';
  END IF;

  IF v_instance.status = 'checked_in' THEN
    RAISE EXCEPTION 'Ticket already checked in at %', v_instance.checked_in_at;
  ELSIF v_instance.status = 'void' THEN
    RAISE EXCEPTION 'Ticket is void';
  END IF;

  SELECT * INTO v_order FROM event_ticket_orders WHERE id = v_instance.ticket_order_id;
  SELECT * INTO v_event FROM events WHERE id = v_instance.event_id;
  SELECT * INTO v_ticket_type FROM event_ticket_types WHERE id = v_instance.ticket_type_id;

  IF v_event.starts_at IS NOT NULL AND v_event.starts_at > now() THEN
    RAISE EXCEPTION 'Event has not started yet (starts at %)', v_event.starts_at;
  END IF;

  UPDATE event_ticket_instances
  SET
    status = 'checked_in',
    checked_in_at = now(),
    checked_in_by = auth.uid()
  WHERE id = v_instance.id
  RETURNING * INTO v_instance;

  IF v_order.user_id IS NOT NULL THEN
    PERFORM award_event_attendance_fave(v_order.user_id, v_instance.event_id);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'ticket_instance', row_to_json(v_instance),
    'event_title', v_event.title,
    'ticket_type_name', v_ticket_type.name,
    'holder_name', v_instance.holder_name,
    'checked_in_at', v_instance.checked_in_at
  );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Add early bird tracking column
ALTER TABLE event_ticket_types
  ADD COLUMN IF NOT EXISTS replaces_ticket_type_id UUID REFERENCES event_ticket_types(id);

-- Table: event_ticket_invitations
CREATE TABLE IF NOT EXISTS event_ticket_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES event_ticket_types(id) ON DELETE CASCADE,
  invitee_user_id UUID,
  invitee_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','used','revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_invites_ticket ON event_ticket_invitations(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_ticket_invites_user ON event_ticket_invitations(invitee_user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_invites_email ON event_ticket_invitations(invitee_email);

ALTER TABLE event_ticket_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage invitations" ON event_ticket_invitations;
DROP POLICY IF EXISTS "Users can view their invitations" ON event_ticket_invitations;

CREATE POLICY "Admins can manage invitations"
  ON event_ticket_invitations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their invitations"
  ON event_ticket_invitations FOR SELECT
  USING (invitee_user_id = auth.uid());

-- Function: Create ticket order with validation
CREATE OR REPLACE FUNCTION create_event_ticket_order(
  p_ticket_type_id UUID,
  p_quantity INTEGER
)
RETURNS event_ticket_orders AS $$
DECLARE
  v_ticket event_ticket_types%ROWTYPE;
  v_existing_qty INTEGER;
  v_available INTEGER;
  v_user_id UUID := auth.uid();
  v_order event_ticket_orders%ROWTYPE;
  v_is_invitation_only BOOLEAN;
  v_user_email TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to purchase tickets';
  END IF;

  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  SELECT * INTO v_ticket FROM event_ticket_types WHERE id = p_ticket_type_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket type not found';
  END IF;

  IF NOT v_ticket.is_active THEN
    RAISE EXCEPTION 'This ticket type is not currently active';
  END IF;

  IF v_ticket.sales_start IS NOT NULL AND v_ticket.sales_start > now() THEN
    RAISE EXCEPTION 'Ticket sales have not started yet (starts: %)', v_ticket.sales_start;
  END IF;

  IF v_ticket.sales_end IS NOT NULL AND v_ticket.sales_end < now() THEN
    RAISE EXCEPTION 'Ticket sales have ended (ended: %)', v_ticket.sales_end;
  END IF;

  IF v_ticket.per_user_limit IS NOT NULL THEN
    SELECT COALESCE(SUM(quantity), 0) INTO v_existing_qty
    FROM event_ticket_orders
    WHERE ticket_type_id = p_ticket_type_id
      AND user_id = v_user_id
      AND status IN ('pending','confirmed');

    IF v_existing_qty + p_quantity > v_ticket.per_user_limit THEN
      RAISE EXCEPTION 'Per-user ticket limit exceeded (limit: %, you have: %, requesting: %)', 
        v_ticket.per_user_limit, v_existing_qty, p_quantity;
    END IF;
  END IF;

  SELECT remaining INTO v_available
  FROM event_ticket_availability
  WHERE ticket_type_id = p_ticket_type_id;

  IF v_available IS NULL OR v_available < p_quantity THEN
    RAISE EXCEPTION 'Not enough tickets remaining (available: %)', COALESCE(v_available, 0);
  END IF;

  v_is_invitation_only := (v_ticket.metadata->>'mode' = 'invitation_only');
  
  IF v_is_invitation_only THEN
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    
    IF NOT EXISTS (
      SELECT 1 FROM event_ticket_invitations
      WHERE ticket_type_id = v_ticket.id
        AND (invitee_user_id = v_user_id OR invitee_email = v_user_email)
        AND status = 'pending'
    ) THEN
      RAISE EXCEPTION 'You are not invited to purchase this ticket type';
    END IF;
  END IF;

  INSERT INTO event_ticket_orders (
    event_id,
    ticket_type_id,
    user_id,
    quantity,
    unit_price,
    currency,
    status
  )
  VALUES (
    v_ticket.event_id,
    v_ticket.id,
    v_user_id,
    p_quantity,
    v_ticket.price,
    v_ticket.currency,
    'pending'
  )
  RETURNING * INTO v_order;

  IF v_is_invitation_only THEN
    UPDATE event_ticket_invitations
    SET status = 'used'
    WHERE ticket_type_id = v_ticket.id
      AND (invitee_user_id = v_user_id OR invitee_email = v_user_email)
      AND status = 'pending';
  END IF;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;