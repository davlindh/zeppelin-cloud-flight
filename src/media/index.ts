// 🏗️ Media Mega-Barrel Export - Single Source for All Media Functionality

// 🎯 TYPES
export type { MediaItem, MediaFilters, MediaType } from '@/types/unified-media';
export type { MediaLibraryItem } from '@/types/mediaLibrary';

// 🎣 HOOKS
export { useMediaLibrary } from '@/hooks/media/useMediaLibrary';
export { useLinkMedia } from '@/hooks/useLinkMedia';
export { useMediaTags } from '@/hooks/useMediaTags';

// 🎪 CONTEXTS
export { useMediaPlayer } from '@/contexts/MediaContext';

// 🧩 COMPONENTS
export {
  MediaGrid,
  MediaLightbox,
  MediaCard,
  MediaFilterPanel,
  MediaUploadDialog,
  MediaLinkManager,
  MediaGallery,
  MediaManager
} from '@/components/media';

// 🛠️ UTILITIES
export { uploadMultipleToMediaLibrary } from '@/utils/media';
export { getMediaIcon, getMediaTypeColor, isPlayableMedia } from '@/utils/media';

// 📊 CONSTANTS (if any)
// Add any media-related constants here in the future
