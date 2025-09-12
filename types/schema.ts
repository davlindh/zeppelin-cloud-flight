// Normalized schema types for imaginary database structure

export interface ParticipantSchema {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar_path?: string;
  website?: string;
  social_links?: Array<{ platform: string; url: string; }>;
  created_at: string;
  updated_at: string;
}

export interface ParticipantMediaSchema {
  id: string;
  participant_id: string;
  type: 'portfolio' | 'video' | 'audio' | 'document' | 'image';
  category: 'featured' | 'process' | 'archive' | 'collaboration';
  url: string;
  title: string;
  description?: string;
  year?: string;
  created_at: string;
}

export interface ProjectSchema {
  id: string;
  title: string;
  description: string;
  full_description?: string;
  image_path?: string;
  purpose?: string;
  expected_impact?: string;
  associations?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectParticipantSchema {
  id: string;
  project_id: string;
  participant_id: string;
  role: string;
  created_at: string;
}

export interface SponsorSchema {
  id: string;
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo_path?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectSponsorSchema {
  id: string;
  project_id: string;
  sponsor_id: string;
  created_at: string;
}

export interface ProjectLinkSchema {
  id: string;
  project_id: string;
  type: 'github' | 'website' | 'demo' | 'other';
  url: string;
  created_at: string;
}

export interface ProjectTagSchema {
  id: string;
  project_id: string;
  tag: string;
  created_at: string;
}

export interface ProjectMediaSchema {
  id: string;
  project_id: string;
  type: 'video' | 'audio' | 'image' | 'document';
  url: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface ProjectBudgetSchema {
  id: string;
  project_id: string;
  amount?: number;
  currency?: string;
  breakdown?: Array<{ item: string; cost: number; }>;
  created_at: string;
}

export interface ProjectTimelineSchema {
  id: string;
  project_id: string;
  start_date?: string;
  end_date?: string;
  milestones?: Array<{ date: string; title: string; description?: string; }>;
  created_at: string;
}

export interface ProjectAccessSchema {
  id: string;
  project_id: string;
  requirements?: string[];
  target_audience?: string;
  capacity?: number;
  registration_required?: boolean;
  created_at: string;
}

export interface ProjectVotingSchema {
  id: string;
  project_id: string;
  enabled: boolean;
  categories?: Array<{ name: string; description?: string; }>;
  results?: Array<{ category: string; score: number; votes: number; }>;
  created_at: string;
}