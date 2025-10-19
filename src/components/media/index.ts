// Core components - used everywhere
export * from './core';

// Admin components - only for /admin routes
export { MediaSubmissionApproval } from './admin/MediaSubmissionApproval';

// Public components
export { PublicMediaGallery } from './public/PublicMediaGallery';

// Re-export existing components for compatibility
export { MediaPreviewPanel } from './MediaPreviewPanel';
export { MediaBulkActionsToolbar } from './MediaBulkActionsToolbar';
export { MediaFilterPanel } from './MediaFilterPanel';
export { RichMediaPreview } from './RichMediaPreview';
