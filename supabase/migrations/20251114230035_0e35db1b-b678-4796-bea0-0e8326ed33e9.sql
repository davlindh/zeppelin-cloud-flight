-- Extend event_registrations table with operational fields
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_event_registrations_approved_at ON public.event_registrations(approved_at);
CREATE INDEX IF NOT EXISTS idx_event_registrations_cancelled_at ON public.event_registrations(cancelled_at);
CREATE INDEX IF NOT EXISTS idx_event_registrations_checked_in_at ON public.event_registrations(checked_in_at);

-- Comment for documentation
COMMENT ON COLUMN public.event_registrations.approved_by IS 'Admin user who approved this registration';
COMMENT ON COLUMN public.event_registrations.approved_at IS 'Timestamp when registration was approved';
COMMENT ON COLUMN public.event_registrations.cancelled_by IS 'Admin or user who cancelled this registration';
COMMENT ON COLUMN public.event_registrations.cancelled_at IS 'Timestamp when registration was cancelled';