// Admin-specific type definitions for better type safety
// Generated from Supabase database schema for 100% accuracy

// Base entity interfaces
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Participant types
export interface SocialLink {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'github' | 'other';
  url: string;
}

export interface Participant extends BaseEntity {
  name: string;
  slug: string;
  bio?: string;
  website?: string;
  avatar_path?: string;
  social_links: SocialLink[]; // jsonb in database, but typed as array for TypeScript
  skills?: string[];
  experience_level?: string;
  interests?: string[];
  time_commitment?: string;
  contributions?: string[];
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  how_found_us?: string;
  availability?: string;
  auth_user_id?: string | null;
  participant_media?: ParticipantMedia[];
}

export interface ParticipantMedia extends BaseEntity {
  participant_id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  title: string;
  description?: string;
}

// Project/Showcase types
export interface Project extends BaseEntity {
  title: string;
  slug?: string;
  description: string;
  full_description?: string;
  purpose?: string;
  expected_impact?: string;
  associations?: string[];
  image_path?: string;
}

export interface ProjectLink extends BaseEntity {
  project_id: string;
  type: 'website' | 'video' | 'social' | 'document';
  url: string;
}

export interface ProjectTag extends BaseEntity {
  project_id: string;
  tag: string;
}

export interface ProjectMedia extends BaseEntity {
  project_id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  title: string;
  description?: string;
}

// Sponsor types
export interface Sponsor extends BaseEntity {
  name: string;
  type: 'main' | 'partner' | 'supporter';
  logo_path?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
}

// Relationship interfaces
export interface ProjectParticipant {
  project_id: string;
  participant_id: string;
  role: string;
  participants: Participant;
}

export interface ProjectSponsor {
  project_id: string;
  sponsor_id: string;
  sponsors: Sponsor;
}

// Form data interfaces
export interface ParticipantFormData {
  name: string;
  slug: string;
  bio?: string;
  website?: string;
  avatar_path?: string;
  social_links: SocialLink[]; // Fixed: matches Participant.social_links type
  skills?: string[];
  experience_level?: string;
  interests?: string[];
  time_commitment?: string;
  contributions?: string[];
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  how_found_us?: string;
  availability?: string;
  avatarFile?: File;
}

export interface ProjectFormData {
  title: string;
  description: string;
  full_description?: string;
  purpose?: string;
  expected_impact?: string;
  associations: string;
}

export interface SponsorFormData {
  name: string;
  type: 'main' | 'partner' | 'supporter';
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_person?: string;
}

// Generic form configuration
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'select' | 'file' | 'email' | 'tel' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: RegExp;
    message?: string;
  };
}

export interface AdminFormConfig {
  title: string;
  fields: FormField[];
  entityName: string;
  bucketName?: string; // for file uploads
  submitEndpoint: string;
}

// Generic table configuration
export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: T) => React.ReactNode;
}

export interface AdminTableConfig {
  columns: TableColumn[];
  searchable?: boolean;
  filterable?: boolean;
  bulkActions?: string[];
  entityName: string;
}

// API Response types
export interface APIResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File upload types
export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  type: ToastType;
  title: string;
  description: string;
}
