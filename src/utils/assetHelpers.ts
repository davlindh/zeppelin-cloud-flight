import { getFullAssetUrl, PLACEHOLDER_ASSETS, STORAGE_BUCKETS } from '../../constants/storage';
import type { MediaType } from '@/types/media';

/**
 * Centralized asset URL resolution utility
 * Handles all media URL resolution logic in one place
 */

export const resolveMediaUrl = (
  url: string, 
  type: MediaType = 'image',
  context: 'project' | 'participant' | 'partner' | 'media' = 'media'
): string => {
  // Return as-is for external URLs (http/https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Return as-is for absolute paths
  if (url.startsWith('/')) {
    return url;
  }
  
  // Handle relative paths by resolving to appropriate bucket
  const bucketMap: Record<string, keyof typeof STORAGE_BUCKETS> = {
    project: 'projects',
    participant: 'participants', 
    partner: 'partners',
    media: 'ui' // Media files use ui bucket as fallback
  };
  
  const bucket = bucketMap[context] || 'ui';
  return getFullAssetUrl(bucket, url);
};

export const getMediaBucket = (type: MediaType): keyof typeof STORAGE_BUCKETS => {
  // Since we only have specific buckets, map all media types to appropriate buckets
  switch (type) {
    case 'video':
    case 'audio':
    case 'document':
    case 'pdf':
    case 'presentation':
    case 'archive':
    case 'code':
    case 'image':
    case 'portfolio':
    case '3d':
    default:
      // All media files go to 'ui' bucket as a fallback since specific media buckets don't exist
      return 'ui';
  }
};

export const getPlaceholderAsset = (
  type: MediaType,
  context: 'project' | 'participant' | 'partner' | 'ui' | 'media' = 'ui'
): string => {
  // Context-specific placeholders
  const contextPlaceholders: Record<string, string> = {
    project: PLACEHOLDER_ASSETS.project,
    participant: PLACEHOLDER_ASSETS.participant,
    partner: PLACEHOLDER_ASSETS.partner,
    ui: PLACEHOLDER_ASSETS.ui,
    media: PLACEHOLDER_ASSETS.ui // fallback to ui for media context
  };

  // Type-specific placeholders with fallbacks
  const typePlaceholders: Record<MediaType, string> = {
    video: '/images/ui/placeholder-video.svg',
    audio: '/images/ui/placeholder-audio.svg',
    image: contextPlaceholders[context],
    portfolio: contextPlaceholders[context],
    document: '/images/ui/placeholder-document.svg',
    pdf: '/images/ui/placeholder-pdf.svg',
    presentation: '/images/ui/placeholder-presentation.svg',
    archive: '/images/ui/placeholder-archive.svg',
    code: '/images/ui/placeholder-code.svg',
    '3d': '/images/ui/placeholder-3d.svg'
  };

  return typePlaceholders[type] || contextPlaceholders[context];
};

export const getPlaceholderImage = (context: 'project' | 'participant' | 'partner' | 'ui' = 'ui'): string => {
  const placeholders = {
    project: '/images/projects/placeholder-project.svg',
    participant: '/images/participants/placeholder-avatar.svg',
    partner: '/images/partners/placeholder-logo.png',
    ui: '/images/ui/placeholder-project.jpg',
  };
  return placeholders[context] || placeholders.ui;
};

export const generateThumbnailUrl = (url: string, type: MediaType): string => {
  // For images, return original (could be enhanced with thumbnail service)
  if (type === 'image' || type === 'portfolio') {
    return resolveMediaUrl(url, type);
  }
  
  // For videos, try platform-specific thumbnail generation
  if (type === 'video') {
    // YouTube thumbnail
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    
    // For other videos, use placeholder
    return getPlaceholderAsset('video');
  }
  
  // For other types, return type-specific placeholder
  return getPlaceholderAsset(type);
};

export const validateMediaUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Allow external URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  
  // Allow absolute and relative paths
  if (url.startsWith('/') || !url.includes('://')) {
    return true;
  }
  
  return false;
};

export const getOptimizedImageUrl = (
  url: string, 
  width?: number, 
  height?: number,
  quality: number = 85
): string => {
  const resolvedUrl = resolveMediaUrl(url, 'image');
  
  // In a real implementation, this would integrate with image optimization service
  // For now, return the resolved URL as-is
  return resolvedUrl;
};
