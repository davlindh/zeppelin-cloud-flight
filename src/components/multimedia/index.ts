/**
 * @deprecated This entire directory is deprecated.
 * Please use the new media system from @/components/media instead:
 * - MediaGallery → @/components/media/core/MediaGallery
 * - MediaGrid → @/components/media/core/MediaGrid
 * - MediaCard → @/components/media/core/MediaCard
 * - MediaFilters → @/components/media/core/MediaFilters
 * - MediaGridSkeleton → @/components/media/core/MediaGridSkeleton
 * 
 * Backwards compatibility exports below:
 */

// Re-export from new location for backwards compatibility
export { MediaGallery } from '@/components/media/core/MediaGallery';
export { MediaGrid as UnifiedMediaGrid } from '@/components/media/core/MediaGrid';
export { MediaGridSkeleton } from '@/components/media/core/MediaGridSkeleton';
export { MediaFilters } from '@/components/media/core/MediaFilters';
