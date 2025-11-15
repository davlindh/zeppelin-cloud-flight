// Type definitions for Block D funding tables
// These extend the Supabase types until they are regenerated

export interface FundingCampaign {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  description?: string | null;
  currency: string;
  target_amount: number;
  raised_amount: number;
  budget_id?: string | null;
  status: 'draft' | 'active' | 'successful' | 'failed' | 'archived';
  starts_at?: string | null;
  deadline?: string | null;
  project_id?: string | null;
  collaboration_project_id?: string | null;
  created_by: string;
  event_id?: string | null;
  series_id?: string | null;
  visibility: 'public' | 'event_members' | 'private';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  projects?: {
    id: string;
    title: string;
    slug: string;
    auth_user_id?: string | null;
  } | null;
  collaboration_projects?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  events?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  project_budget?: ProjectBudget | null;
}

export interface ProjectBudget {
  id: string;
  project_id?: string | null;
  total_amount?: number | null;
  secured_from_sponsors?: number | null;
  raised_from_donations?: number | null;
  status?: 'planning' | 'fundraising' | 'funded' | 'closed' | null;
  breakdown?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  campaign_id: string;
  donor_user_id?: string | null;
  donor_name?: string | null;
  donor_email?: string | null;
  amount: number;
  currency: string;
  payment_provider?: string | null;
  payment_reference?: string | null;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  message?: string | null;
  is_anonymous: boolean;
  fave_points_earned?: number | null;
  created_at: string;
  confirmed_at?: string | null;
  metadata: Record<string, any>;
}

export interface SponsorContribution {
  id: string;
  sponsor_id: string;
  campaign_id?: string | null;
  project_id?: string | null;
  amount: number;
  currency: string;
  contributed_at: string;
  is_recurring: boolean;
  recurrence_interval?: string | null;
  notes?: string | null;
  created_at: string;
  funding_campaigns?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  projects?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}
