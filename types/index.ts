// Main types file - Consolidated type system
// Single source of truth for all application types

// Re-export unified types (includes ShowcaseCard and core types)
export type {
  ShowcaseCard,
  Participant,
  Project,
  Sponsor
} from '../src/types/unified';

// Re-export admin types for convenience
export type {
  ParticipantFormData,
  ProjectFormData,
  SponsorFormData,
  SocialLink
} from '../src/types/admin';

// Re-export unified media types
export type {
  MediaItem,
  MediaType,
  MediaCategory,
  MediaCollection,
  MediaFilters,
  MediaViewMode,
  MediaDisplayConfig
} from '../src/types/unified-media';

// Re-export database schema types
export type {
  TableName,
  Database
} from '../src/types/schema';

// Database-specific types for complex fields (no conflicts)
export interface ProjectBudgetData {
  id: string;
  project_id: string;
  amount?: number;
  currency?: string;
  breakdown?: Array<{ item: string; cost: number }>;
  created_at: string;
}

export interface ProjectTimelineData {
  id: string;
  project_id: string;
  start_date?: string;
  end_date?: string;
  milestones?: Array<{ date: string; title: string; description?: string }>;
  created_at: string;
}

export interface ProjectVotingData {
  id: string;
  project_id: string;
  enabled?: boolean;
  categories?: Array<{ name: string; description?: string }>;
  results?: Array<{ category: string; score: number; votes: number }>;
  created_at: string;
}

export interface ProjectAccessData {
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
