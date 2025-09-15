// API Type Definitions for TanStack Query
// These replace all "any" types with proper TypeScript interfaces

import type { Database } from '@/integrations/supabase/types';

// Base types from Supabase
type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

// Project types
export interface Project {
  id: string;
  slug: string;
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

export interface ProjectWithRelations extends Project {
  participants: ProjectParticipant[];
  sponsors: Sponsor[];
  links: ProjectLink[];
  tags: string[];
  media: ProjectMedia[];
  budget?: ProjectBudget;
  timeline?: ProjectTimeline;
  access?: ProjectAccess;
}

// Participant types
export interface Participant {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  website?: string;
  avatar_path?: string;
  social_links?: SocialLink[];
  created_at: string;
  updated_at: string;
}

export interface ParticipantWithMedia extends Participant {
  participant_media: ParticipantMedia[];
}

// Sponsor types
export interface Sponsor {
  id: string;
  name: string;
  type: 'individual' | 'company' | 'organization' | 'foundation';
  logo_path?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Relationship types
export interface ProjectParticipant {
  project_id: string;
  participant_id: string;
  role: string;
  participant: Participant;
}

export interface ProjectSponsor {
  project_id: string;
  sponsor_id: string;
  sponsor: Sponsor;
}

export interface ProjectLink {
  id: string;
  project_id: string;
  type: 'website' | 'github' | 'demo' | 'documentation' | 'other';
  url: string;
  title?: string;
  description?: string;
}

export interface ProjectMedia {
  id: string;
  project_id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface ParticipantMedia {
  id: string;
  participant_id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface ProjectBudget {
  id: string;
  project_id: string;
  amount?: number;
  currency?: string;
  breakdown?: BudgetItem[];
}

export interface ProjectTimeline {
  id: string;
  project_id: string;
  start_date?: string;
  end_date?: string;
  milestones?: Milestone[];
}

export interface ProjectAccess {
  id: string;
  project_id: string;
  requirements?: string[];
  target_audience?: string;
  capacity?: number;
  registration_required?: boolean;
}

// Supporting types
export interface SocialLink {
  platform: string;
  url: string;
  username?: string;
}

export interface BudgetItem {
  category: string;
  amount: number;
  description?: string;
}

export interface Milestone {
  title: string;
  description?: string;
  date?: string;
  completed?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiErrorResponse {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

// Query Key types for TanStack Query
export type QueryKeys = {
  // Projects
  projects: readonly ['projects'];
  project: readonly ['projects', string];
  projectDetail: readonly ['projects', 'detail', string];

  // Participants
  participants: readonly ['participants'];
  participant: readonly ['participants', string];
  participantDetail: readonly ['participants', 'detail', string];

  // Sponsors
  sponsors: readonly ['sponsors'];
  sponsor: readonly ['sponsors', string];

  // Search and filters
  search: readonly ['search', string];
  filteredProjects: readonly ['projects', 'filtered', Record<string, unknown>];
  filteredParticipants: readonly ['participants', 'filtered', Record<string, unknown>];
};

// Mutation types
export interface CreateProjectData {
  title: string;
  slug: string;
  description: string;
  full_description?: string;
  image_path?: string;
  purpose?: string;
  expected_impact?: string;
  associations?: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

export interface ProjectRelationships {
  participants?: Array<{ participant_id: string; role: string }>;
  sponsors?: string[];
  links?: Array<{ type: string; url: string; title?: string; description?: string }>;
  tags?: string[];
  media?: Array<{ type: string; url: string; title: string; description?: string }>;
  budget?: { amount?: number; currency?: string; breakdown?: BudgetItem[] };
  timeline?: { start_date?: string; end_date?: string; milestones?: Milestone[] };
  access?: { requirements?: string[]; target_audience?: string; capacity?: number; registration_required?: boolean };
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility types for TanStack Query
export type UseQueryOptions<T> = {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: boolean | number | ((failureCount: number, error: unknown) => boolean);
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

export type UseMutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: unknown, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: unknown, variables: TVariables) => void;
};
