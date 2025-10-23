# Media Component Reorganization Documentation

## Overview

The media component system has been reorganized into a clear, layered architecture with proper separation of concerns. This document explains the new structure, naming conventions, and import patterns.

## Directory Structure

```
src/components/media/
├── core/                    # Universal components (used everywhere)
│   ├── MediaCardSimple.tsx
│   ├── MediaGrid.tsx
│   ├── MediaGallery.tsx
│   ├── MediaFilters.tsx
│   ├── MediaGridSkeleton.tsx
│   ├── MediaPlayer.tsx
│   ├── MediaLightbox.tsx
│   ├── RichMediaPreview.tsx
│   ├── PersistentMediaPlayer.tsx
│   └── index.ts
├── shared/                  # Shared utilities (admin + public)
│   ├── MediaApprovalBadge.tsx
│   ├── MediaCardAdmin.tsx
│   ├── MediaLinkingSelector.tsx
│   ├── MediaUploadZone.tsx
│   ├── MediaViewModeToggle.tsx
│   ├── PopularTags.tsx
│   ├── TagAutocomplete.tsx
│   └── index.ts
├── admin/                   # Admin-only components
│   ├── MediaSubmissionApproval.tsx
│   ├── MediaPreviewPanel.tsx
│   ├── MediaBulkActionsToolbar.tsx
│   ├── MediaFilterPanel.tsx
│   ├── MediaFilterPanelBasic.tsx
│   ├── MediaUploadDialog.tsx
│   ├── MediaLinkManager.tsx
│   ├── StorageImportDialog.tsx
│   ├── WorkflowStageCard.tsx
│   ├── WorkflowProgress.tsx
│   ├── MediaToolbar.tsx
│   ├── MediaUsagePanel.tsx
│   ├── MediaStorageStats.tsx
│   ├── TagEditor.tsx
│   ├── MediaLinkDialog.tsx
│   └── index.ts
├── public/                  # Public-facing components
│   ├── PublicMediaGallery.tsx
│   └── index.ts
├── MediaManager.tsx  # Main unified component
└── index.ts                 # Main export file
```

## Component Categories

### Core Components (`/core`)
**Purpose:** Universal components used across all contexts (public pages, admin panels, entity displays)

**Components:**
- `MediaCardSimple` - Simple media card display
- `MediaGrid` - Grid layout for media items
- `MediaGallery` - Full gallery component
- `MediaFilters` - Filtering controls
- `MediaGridSkeleton` - Loading skeleton
- `MediaPlayer` - Audio/video player
- `MediaLightbox` - Lightbox viewer
- `RichMediaPreview` - Rich preview component
- `PersistentMediaPlayer` - Global persistent player

**Import Pattern:**
```typescript
import { MediaGrid, MediaPlayer } from '@/components/media';
// or
import { MediaGrid, MediaPlayer } from '@/components/media/core';
```

### Shared Components (`/shared`)
**Purpose:** Components shared between admin and public contexts, typically UI utilities and form controls

**Components:**
- `MediaApprovalBadge` - Approval status badge
- `MediaCardAdmin` - Admin-enhanced media card
- `MediaLinkingSelector` - Entity linking interface
- `MediaUploadZone` - Drag-and-drop upload zone
- `MediaViewModeToggle` - Grid/list view toggle
- `PopularTags` - Popular tags display
- `TagAutocomplete` - Tag input with autocomplete

**Import Pattern:**
```typescript
import { TagAutocomplete, MediaViewModeToggle } from '@/components/media';
// or
import { TagAutocomplete, MediaViewModeToggle } from '@/components/media/shared';
```

### Admin Components (`/admin`)
**Purpose:** Admin-only functionality for media management, moderation, and system operations

**Components:**
- `MediaSubmissionApproval` - Approve/reject submissions
- `MediaPreviewPanel` - Detailed preview panel
- `MediaBulkActionsToolbar` - Bulk operations toolbar
- `MediaFilterPanel` - Advanced filtering
- `MediaFilterPanelBasic` - Basic filtering
- `MediaUploadDialog` - Upload dialog
- `MediaLinkManager` - Manage entity links
- `StorageImportDialog` - Import from storage
- `WorkflowStageCard` - Workflow stage display
- `WorkflowProgress` - Workflow progress tracker
- `MediaToolbar` - Admin toolbar
- `MediaUsagePanel` - Storage usage panel
- `MediaStorageStats` - Storage statistics
- `TagEditor` - Batch tag editor
- `MediaLinkDialog` - Link entities dialog

**Import Pattern:**
```typescript
import { MediaToolbar, TagEditor } from '@/components/media';
// or
import { MediaToolbar, TagEditor } from '@/components/media/admin';
```

### Public Components (`/public`)
**Purpose:** Public-facing components for end users (non-admin contexts)

**Components:**
- `PublicMediaGallery` - Public gallery view

**Import Pattern:**
```typescript
import { PublicMediaGallery } from '@/components/media';
// or
import { PublicMediaGallery } from '@/components/media/public';
```

## Main Export File

The main `index.ts` file re-exports all components from subdirectories:

```typescript
// Core components - used everywhere
export * from './core';

// Shared components - used by both admin and public contexts
export * from './shared';

// Admin components - only for /admin routes
export * from './admin';

// Public components - for public-facing pages
export * from './public';

// Unified media manager - main component for entity media
export { MediaManager } from './MediaManager';
```

## Import Guidelines

### Recommended: Import from Main Index
```typescript
// Best practice - clear and simple
import { 
  MediaGrid, 
  MediaPlayer, 
  TagAutocomplete, 
  MediaToolbar 
} from '@/components/media';
```

### Alternative: Import from Subdirectory
```typescript
// When you need explicit categorization
import { MediaGrid } from '@/components/media/core';
import { TagAutocomplete } from '@/components/media/shared';
import { MediaToolbar } from '@/components/media/admin';
```

### Cross-Component Imports
When components within the media system need to import from each other:

```typescript
// From admin to shared (correct)
import { TagAutocomplete } from '../shared/TagAutocomplete';

// From shared to core (correct)
import { MediaGrid } from '../core/MediaGrid';

// Never import from admin to public or vice versa
```

## Naming Conventions

### File Naming
- **PascalCase** for component files: `MediaToolbar.tsx`
- **camelCase** for utility files: `mediaUpload.ts`
- **kebab-case** for directory names: `media-admin/` (if needed for sub-organization)

### Component Naming
- Prefix with `Media` for media-specific components: `MediaToolbar`, `MediaGrid`
- Use descriptive, role-based names: `MediaSubmissionApproval`, not `MediaApprove`
- Admin components can include "Admin" suffix if clarity needed: `MediaCardAdmin`

### Export Naming
- Always use **named exports**, never default exports
- Export interface/type definitions alongside components
- Keep exports alphabetically sorted in index files

## Migration Notes

### Components Moved

**To `/shared`:**
- `MediaViewModeToggle.tsx` (from `/media` root)
- `PopularTags.tsx` (from `/media` root)
- `TagAutocomplete.tsx` (from `/media` root)

**To `/admin`:**
- `MediaToolbar.tsx` (from `/media` root)
- `MediaUsagePanel.tsx` (from `/media` root)
- `MediaStorageStats.tsx` (from `/media` root)
- `TagEditor.tsx` (from `/media` root)
- `MediaLinkDialog.tsx` (from `/media` root)

### Import Updates Required

Fixed imports in:
- `src/components/media/admin/TagEditor.tsx` - Updated TagAutocomplete import from `./TagAutocomplete` to `../shared/TagAutocomplete`

## Special Considerations

### MediaGrid Duplication
- `MediaGrid` exists in both `/core` and `/shared` directories
- Only exported from `/core/index.ts` to avoid duplication conflicts
- The `/shared/MediaGrid.tsx` may be for a specialized admin version (requires verification)

### MediaManager
- Lives at `/media` root level (not in subdirectories)
- Main component for entity-based media management
- Exported directly from main index

## Related Files

### Hooks
- `src/hooks/media/useMediaLibrary.ts` - Main data fetching hook with filtering and selection (renamed from useMedia)
- `src/hooks/useLinkMedia.ts` - Entity linking operations
- `src/hooks/useMediaTags.ts` - Tag management and statistics
- `src/hooks/useAdminMedia.ts` - Admin-specific operations

### Types
- `src/types/mediaLibrary.ts` - TypeScript interfaces
- `src/types/admin.ts` - Admin-specific types

### Utilities
- `src/utils/mediaUpload.ts` - Upload functionality
- `src/utils/mediaValidation.ts` - Validation logic

### Configuration
- `constants/storage.ts` - Storage bucket configuration
- `src/config/storage.config.ts` - Storage settings

## Database Schema

### Tables
- `media_library` - Main media items table
- `media_project_links` - Project associations
- `media_participant_links` - Participant associations
- `media_sponsor_links` - Sponsor associations

### Storage Buckets
- `media-files` - Public media (50MB limit)
- `documents` - Private documents (20MB limit)

## Best Practices

1. **Always import from the main index** unless you have a specific reason not to
2. **Keep components in their proper category** - don't mix admin logic in public components
3. **Use relative imports for cross-component dependencies** within the media directory
4. **Maintain alphabetical order** in export files for easy scanning
5. **Document component purpose** with clear JSDoc comments
6. **Test imports** after reorganization to catch broken references
7. **Update documentation** when adding new components

## Future Considerations

### Potential Subdirectory Organization
If categories grow too large, consider further subdivision:

```
admin/
├── approval/
│   ├── MediaSubmissionApproval.tsx
│   └── WorkflowStageCard.tsx
├── bulk-operations/
│   ├── MediaBulkActionsToolbar.tsx
│   └── TagEditor.tsx
└── panels/
    ├── MediaPreviewPanel.tsx
    └── MediaUsagePanel.tsx
```

### Component Consolidation
- Review if `MediaFilterPanel` and `MediaFilterPanelBasic` can be merged
- Consider if multiple dialog components can use a shared base

### TypeScript Organization
- Consider creating separate type files per category: `core.types.ts`, `admin.types.ts`
- Consolidate common prop patterns into reusable interfaces

## Troubleshooting

### Import Not Found
- Check if component exists in expected subdirectory
- Verify export exists in subdirectory's `index.ts`
- Ensure main `/media/index.ts` re-exports the subdirectory

### Duplicate Export Error
- Check for naming conflicts between categories
- Review if component should only exist in one location
- Consider renaming one variant if both are needed

### Build Errors After Reorganization
1. Clear build cache: `npm run clean` or delete `dist/` folder
2. Restart development server
3. Check for circular dependencies
4. Verify all import paths updated

## Questions or Issues?

For questions about the media system organization:
1. Check this documentation first
2. Review the related MEDIA_MIGRATION_SUMMARY.md
3. Examine existing component implementations
4. Ask in team channels with context

Last Updated: 2025-10-23
