// Main types file - Clean implementation based on Supabase database schema
// No legacy types - modern type system for first version

// Re-export admin types for convenience
export type {
  Participant,
  Project,
  Sponsor,
  SocialLink,
  ParticipantFormData,
  ProjectFormData,
  SponsorFormData
} from '../src/types/admin';

// Re-export unified media types
export type {
  UnifiedMediaItem,
  MediaType,
  MediaCategory,
  MediaCollection,
  MediaFilters,
  MediaViewMode,
  MediaDisplayConfig
} from '../src/types/unified-media';

// Database-specific types for complex fields
export interface ProjectBudget {
  id: string;
  project_id: string;
  amount?: number;
  currency?: string;
  breakdown?: Array<{ item: string; cost: number }>;
  created_at: string;
}

export interface ProjectTimeline {
  id: string;
  project_id: string;
  start_date?: string;
  end_date?: string;
  milestones?: Array<{ date: string; title: string; description?: string }>;
  created_at: string;
}

export interface ProjectVoting {
  id: string;
  project_id: string;
  enabled?: boolean;
  categories?: Array<{ name: string; description?: string }>;
  results?: Array<{ category: string; score: number; votes: number }>;
  created_at: string;
}

export interface ProjectAccess {
  id: string;
  project_id: string;
  requirements?: string[];
  target_audience?: string;
  capacity?: number;
  registration_required?: boolean;
  created_at: string;
}

// Submission types
export interface Submission {
  id: string;
  type: 'project' | 'participant' | 'media' | 'partnership' | 'collaboration';
  title: string;
  content: Record<string, unknown>; // jsonb
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
  created_at: string;
  processed_at?: string;
  session_id?: string;
  device_fingerprint?: string;
  ip_address?: string;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  language_preference?: string;
  how_found_us?: string;
  publication_permission?: boolean;
  files?: Array<Record<string, unknown>>; // jsonb
}

// Admin settings
export interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, unknown>; // jsonb
  description?: string;
  created_at: string;
  updated_at: string;
}
