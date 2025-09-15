// Unified Media Types - Clean implementation based on Supabase database schema
// No legacy aliases - modern type system for first version

export type MediaType = 'video' | 'audio' | 'image' | 'document' | 'portfolio' | 'pdf' | 'presentation' | 'archive' | 'code' | '3d';
export type MediaCategory = 'featured' | 'process' | 'archive' | 'collaboration' | 'promotional' | 'technical' | 'artistic';

/**
 * Unified MediaItem interface based on database schema
 * Consolidates project_media and participant_media tables
 */
export interface UnifiedMediaItem {
  id: string;
  type: MediaType;
  category?: MediaCategory; // Optional for project media, required for participant media
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number; // in seconds for audio/video
  size?: number; // file size in bytes
  mimeType?: string;

  // Entity relationships (optional - used by different contexts)
  projectId?: string;
  participantId?: string;
  partnerId?: string;
  year?: string; // For participant media

  // Additional metadata
  tags?: string[];
  metadata?: Record<string, unknown>;

  // Timestamps
  created_at?: string;
}

/**
 * Media collection grouping
 */
export interface MediaCollection {
  id: string;
  title: string;
  description?: string;
  items: UnifiedMediaItem[];
  category: MediaCategory;
  thumbnail?: string;
}

/**
 * Media filtering options
 */
export interface MediaFilters {
  types?: MediaType[];
  categories?: MediaCategory[];
  year?: string;
  searchTerm?: string;
  tags?: string[];
  sortBy?: 'title' | 'type' | 'year' | 'created' | 'size';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Media view modes
 */
export type MediaViewMode = 'grid' | 'list' | 'masonry';

/**
 * Media display configurations
 */
export interface MediaDisplayConfig {
  viewMode?: MediaViewMode;
  showThumbnails?: boolean;
  showDescriptions?: boolean;
  showMetadata?: boolean;
  showPlayButtons?: boolean;
  showDownloadButtons?: boolean;
  enableQueue?: boolean;
  maxItemsPerRow?: number;
  itemSize?: 'small' | 'medium' | 'large';
}
