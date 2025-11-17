-- Add recurring donation support to donations table
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_interval text,
ADD COLUMN IF NOT EXISTS next_billing_date timestamptz,
ADD COLUMN IF NOT EXISTS subscription_status text;

-- Create donation_subscriptions table
CREATE TABLE IF NOT EXISTS donation_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES funding_campaigns(id) ON DELETE CASCADE,
  donor_user_id uuid NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'SEK',
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
  interval text NOT NULL DEFAULT 'month' CHECK (interval IN ('month', 'year')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_donation_subscriptions_campaign ON donation_subscriptions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donation_subscriptions_donor ON donation_subscriptions(donor_user_id);
CREATE INDEX IF NOT EXISTS idx_donation_subscriptions_status ON donation_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_donations_subscription ON donations(subscription_id) WHERE subscription_id IS NOT NULL;

-- RLS policies for donation_subscriptions
ALTER TABLE donation_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON donation_subscriptions FOR SELECT
  USING (donor_user_id = auth.uid());

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON donation_subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update subscriptions
CREATE POLICY "Admins can update subscriptions"
  ON donation_subscriptions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_donation_subscriptions_updated_at
  BEFORE UPDATE ON donation_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();