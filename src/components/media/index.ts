// Media library component exports

// Core components - fundamental media display and interaction
export { MediaCard } from './core/MediaCard';
// Note: MediaGrid from core is not exported - use shared/MediaGrid for advanced features
export { MediaGallery } from './core/MediaGallery';
export { MediaFilters } from './core/MediaFilters';
export { MediaGridSkeleton } from './core/MediaGridSkeleton';
export { MediaLightbox } from './core/MediaLightbox';
export { RichMediaPreview } from './core/RichMediaPreview';

// Shared components - used across admin and public contexts
export { MediaApprovalBadge } from './shared/MediaApprovalBadge';
export { MediaCardAdmin } from './shared/MediaCardAdmin';
export { MediaGrid } from './shared/MediaGrid'; // Advanced grid with selection for admin
export { MediaLinkingSelector } from './shared/MediaLinkingSelector';
export { MediaUploadZone } from './shared/MediaUploadZone';
export { MediaViewModeToggle } from './shared/MediaViewModeToggle';
export type { ViewMode } from './shared/MediaViewModeToggle';
export { PopularTags } from './shared/PopularTags';
export { TagAutocomplete } from './shared/TagAutocomplete';

// Admin components - administrative media management
export { MediaBulkActionsToolbar } from './admin/MediaBulkActionsToolbar';
export { MediaFilterPanel } from './admin/MediaFilterPanel';
export { MediaFilterPanelBasic } from './admin/MediaFilterPanelBasic';
export { MediaLinkDialog } from './admin/MediaLinkDialog';
export { MediaLinkManager } from './admin/MediaLinkManager';
export { MediaPreviewPanel } from './admin/MediaPreviewPanel';
export { MediaStorageStats } from './admin/MediaStorageStats';
export { MediaSubmissionApproval } from './admin/MediaSubmissionApproval';
export { MediaToolbar } from './admin/MediaToolbar';
export { MediaUploadDialog } from './admin/MediaUploadDialog';
export { MediaUsagePanel } from './admin/MediaUsagePanel';
export { StorageImportDialog } from './admin/StorageImportDialog';
export { TagEditor } from './admin/TagEditor';
export { WorkflowProgress } from './admin/WorkflowProgress';
export { WorkflowStageCard } from './admin/WorkflowStageCard';

// Public components - for public-facing media galleries
// Note: Public media gallery functionality moved to core/MediaGallery

// Main media management components
export { MediaManager } from './MediaManager';

// Specialized image component with lazy loading and Supabase integration
export { Image } from './Image';
