-- Create enum types for funding system
CREATE TYPE funding_campaign_status AS ENUM ('draft', 'active', 'successful', 'failed', 'archived');
CREATE TYPE funding_campaign_visibility AS ENUM ('public', 'event_members', 'private');
CREATE TYPE donation_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE project_budget_status AS ENUM ('planning', 'fundraising', 'funded', 'closed');

-- Create funding_campaigns table
CREATE TABLE public.funding_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'SEK',
  target_amount NUMERIC(10,2) NOT NULL,
  raised_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  budget_id UUID,
  status funding_campaign_status NOT NULL DEFAULT 'draft',
  starts_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  collaboration_project_id UUID REFERENCES public.collaboration_projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  series_id UUID,
  created_by UUID NOT NULL,
  visibility funding_campaign_visibility NOT NULL DEFAULT 'public',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create project_budgets table
CREATE TABLE public.project_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  total_amount NUMERIC(10,2),
  secured_from_sponsors NUMERIC(10,2),
  raised_from_donations NUMERIC(10,2),
  status project_budget_status DEFAULT 'planning',
  breakdown JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key for budget_id after project_budgets is created
ALTER TABLE public.funding_campaigns 
  ADD CONSTRAINT funding_campaigns_budget_id_fkey 
  FOREIGN KEY (budget_id) REFERENCES public.project_budgets(id) ON DELETE SET NULL;

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.funding_campaigns(id) ON DELETE CASCADE,
  donor_user_id UUID,
  donor_name TEXT,
  donor_email TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SEK',
  payment_provider TEXT,
  payment_reference TEXT,
  status donation_status NOT NULL DEFAULT 'pending',
  message TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  fave_points_earned INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Create sponsor_contributions table
CREATE TABLE public.sponsor_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.funding_campaigns(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SEK',
  contributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_interval TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_donations_campaign_id ON public.donations(campaign_id);
CREATE INDEX idx_donations_donor_user_id ON public.donations(donor_user_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX idx_funding_campaigns_slug ON public.funding_campaigns(slug);
CREATE INDEX idx_funding_campaigns_created_by ON public.funding_campaigns(created_by);
CREATE INDEX idx_funding_campaigns_status ON public.funding_campaigns(status);
CREATE INDEX idx_funding_campaigns_visibility ON public.funding_campaigns(visibility);
CREATE INDEX idx_sponsor_contributions_sponsor_id ON public.sponsor_contributions(sponsor_id);
CREATE INDEX idx_sponsor_contributions_campaign_id ON public.sponsor_contributions(campaign_id);

-- Enable RLS on all tables
ALTER TABLE public.funding_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for funding_campaigns
CREATE POLICY "Public can read active/successful public campaigns"
  ON public.funding_campaigns FOR SELECT
  USING (
    visibility = 'public' 
    AND status IN ('active', 'successful')
  );

CREATE POLICY "Event members can read event campaigns"
  ON public.funding_campaigns FOR SELECT
  USING (
    visibility = 'event_members'
    AND event_id IN (
      SELECT event_id FROM public.event_registrations
      WHERE user_id = auth.uid() AND status = 'confirmed'
    )
  );

CREATE POLICY "Campaign creators can read their campaigns"
  ON public.funding_campaigns FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Campaign creators can update their campaigns"
  ON public.funding_campaigns FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Authenticated users can create campaigns"
  ON public.funding_campaigns FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Admins have full access to campaigns"
  ON public.funding_campaigns FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for donations
CREATE POLICY "Anyone can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read their own donations"
  ON public.donations FOR SELECT
  USING (donor_user_id = auth.uid());

CREATE POLICY "Admins can read all donations"
  ON public.donations FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update donations"
  ON public.donations FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Campaign creators can read campaign donations"
  ON public.donations FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.funding_campaigns
      WHERE created_by = auth.uid()
    )
  );

-- RLS Policies for project_budgets
CREATE POLICY "Public can read all budgets"
  ON public.project_budgets FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to budgets"
  ON public.project_budgets FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for sponsor_contributions
CREATE POLICY "Public can read contributions"
  ON public.sponsor_contributions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage contributions"
  ON public.sponsor_contributions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create trigger function to handle donation success
CREATE OR REPLACE FUNCTION public.handle_donation_succeeded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_points INTEGER;
BEGIN
  -- Only process when status changes to 'succeeded'
  IF OLD.status != 'succeeded' AND NEW.status = 'succeeded' THEN
    
    -- Update campaign raised_amount
    UPDATE public.funding_campaigns
    SET 
      raised_amount = raised_amount + NEW.amount,
      updated_at = now()
    WHERE id = NEW.campaign_id;
    
    -- Set confirmed_at if not set
    IF NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at := now();
    END IF;
    
    -- Award Fave points to donor (if authenticated)
    IF NEW.donor_user_id IS NOT NULL THEN
      -- Calculate points: 1 point per 10 SEK (or equivalent)
      v_points := GREATEST(FLOOR(NEW.amount / 10)::INTEGER, 5);
      
      -- Store points earned
      NEW.fave_points_earned := v_points;
      
      -- Award points via transaction
      PERFORM apply_fave_transaction(
        NEW.donor_user_id,
        v_points,
        'donation_made',
        'donation',
        NEW.id,
        'fundraising',
        jsonb_build_object(
          'campaign_id', NEW.campaign_id,
          'amount', NEW.amount,
          'currency', NEW.currency
        )
      );
    END IF;
  END IF;
  
  -- Handle refunds
  IF OLD.status = 'succeeded' AND NEW.status = 'refunded' THEN
    -- Decrease campaign raised_amount
    UPDATE public.funding_campaigns
    SET 
      raised_amount = GREATEST(raised_amount - OLD.amount, 0),
      updated_at = now()
    WHERE id = NEW.campaign_id;
    
    -- Reverse Fave points if they were awarded
    IF OLD.fave_points_earned IS NOT NULL AND NEW.donor_user_id IS NOT NULL THEN
      PERFORM apply_fave_transaction(
        NEW.donor_user_id,
        -OLD.fave_points_earned,
        'donation_refunded',
        'donation',
        NEW.id,
        'fundraising',
        jsonb_build_object(
          'campaign_id', NEW.campaign_id,
          'amount', OLD.amount,
          'currency', OLD.currency
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_donation_status_change
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_donation_succeeded();

-- Create trigger for updated_at on funding_campaigns
CREATE TRIGGER update_funding_campaigns_updated_at
  BEFORE UPDATE ON public.funding_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on project_budgets
CREATE TRIGGER update_project_budgets_updated_at
  BEFORE UPDATE ON public.project_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();