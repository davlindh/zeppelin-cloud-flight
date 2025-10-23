/**
 * Media Utilities Barrel Export
 *
 * Purpose: Centralized exports for all media-related utility functions
 * including helpers, upload utilities, color schemes, and metadata processing.
 *
 * Components should import from here: `import { mediaHelpers, mediaUpload } from '@/utils/media'`
 */

// Core media helpers and utilities
export * from './mediaHelpers';
export * from './mediaUpload';
export * from './mediaColorScheme';
export * from './thumbnailHelpers';
export * from './mediaMetadataExtractor';
export * from './mediaMetadataReprocessor';

// Re-export commonly used functions with clear names
export {
  getMediaIcon,
  getMediaTypeColor,
  isPlayableMedia,
  formatDuration,
  formatFileSize,
  generateMediaId
} from './mediaHelpers';

export {
  uploadMultipleToMediaLibrary,
  validateMediaFile,
  processMediaMetadata
} from './mediaUpload';

export {
  getMediaColorScheme,
  getStatusColorScheme
} from './mediaColorScheme';

export {
  getThumbnailUrl,
  generateSrcSet,
  getResponsiveImageUrl
} from './thumbnailHelpers';
