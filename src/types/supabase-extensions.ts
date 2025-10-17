// Temporary type extensions for new tables until Supabase syncs types
// This file will be deprecated once src/integrations/supabase/types.ts is updated

import type { Database as GeneratedDatabase } from '@/integrations/supabase/types';

export interface MediaLibraryRow {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  original_filename: string | null;
  type: 'image' | 'video' | 'audio' | 'document';
  mime_type: string;
  bucket: string;
  storage_path: string;
  public_url: string;
  thumbnail_url: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  source: 'admin-upload' | 'submission' | 'participant' | 'project' | 'imported' | null;
  uploaded_by: string | null;
  submission_id: string | null;
  project_id: string | null;
  participant_id: string | null;
  tags: string[];
  category: string | null;
  is_public: boolean;
  is_featured: boolean;
  uploaded_at: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Extended Database type with new tables
export interface Database extends GeneratedDatabase {
  public: GeneratedDatabase['public'] & {
    Tables: GeneratedDatabase['public']['Tables'] & {
      media_library: {
        Row: MediaLibraryRow;
        Insert: Partial<MediaLibraryRow> & {
          title: string;
          filename: string;
          type: MediaLibraryRow['type'];
          mime_type: string;
          storage_path: string;
          public_url: string;
          bucket: string;
        };
        Update: {
          [K in keyof MediaLibraryRow]?: MediaLibraryRow[K];
        };
        Relationships: [];
      };
    };
  };
}
