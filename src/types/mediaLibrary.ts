// TypeScript types for media_library table

export type MediaType = 'image' | 'video' | 'audio' | 'document';
export type MediaStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type MediaSource = 'admin-upload' | 'submission' | 'participant' | 'project' | 'imported';

export interface MediaLibraryItem {
  id: string;
  
  // Basic Info
  title: string;
  description: string | null;
  filename: string;
  original_filename: string | null;
  
  // Media Type
  type: MediaType;
  mime_type: string;
  
  // Storage
  bucket: string;
  storage_path: string;
  public_url: string;
  thumbnail_url: string | null;
  
  // Metadata
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  
  // Workflow
  status: MediaStatus;
  source: MediaSource | null;
  
  // Relations
  uploaded_by: string | null;
  submission_id: string | null;
  project_id: string | null;
  participant_id: string | null;
  
  // Organization
  tags: string[];
  category: string | null;
  is_public: boolean;
  is_featured: boolean;
  
  // Timestamps
  uploaded_at: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaFilters {
  type?: MediaType | MediaType[];
  status?: MediaStatus | MediaStatus[];
  source?: MediaSource | MediaSource[];
  project_id?: string;
  participant_id?: string;
  submission_id?: string;
  category?: string;
  tags?: string[];
  search?: string;
  is_featured?: boolean;
  is_public?: boolean;
}

export interface MediaUploadOptions {
  folder?: string;
  metadata?: Partial<MediaLibraryItem>;
  projectId?: string;
  participantId?: string;
  submissionId?: string;
  autoApprove?: boolean;
}

export interface MediaUpdateData {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  is_featured?: boolean;
  is_public?: boolean;
  status?: MediaStatus;
  project_id?: string;
  participant_id?: string;
}
