import React from 'react';
import { MediaFilters, MediaGrid, MediaGallery } from '../multimedia';
import { Button } from '@/components/ui/button';
import type { ProjectMediaItem } from '@/types/media';
import { generateMediaId } from '@/utils/mediaHelpers';
import { useMediaFiltering } from '@/hooks/useMediaFiltering';
import { getFullAssetUrl } from '../../constants/storage';

interface EnhancedProjectMediaProps {
  media?: Array<{
    type: 'video' | 'audio' | 'image' | 'document' | 'pdf' | 'presentation' | 'archive' | 'code' | '3d' | 'portfolio';
    url: string;
    title: string;
    description?: string;
  }>;
  showPreview?: boolean;
  allowCategorization?: boolean;
}

// URL resolution function
const resolveMediaUrl = (url: string, type: string): string => {
  // If already a full URL (http/https), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If starts with /, it's already a proper path
  if (url.startsWith('/')) {
    return url;
  }
  
  // Handle relative paths based on media type
  if (type === 'image') {
    // Check if it's a project image path
    if (url.startsWith('projects/')) {
      return getFullAssetUrl('projects', url.replace('projects/', ''));
    }
    return `/images/${url}`;
  }
  
  // For videos and other media, assume media bucket
  if (type === 'video' || type === 'audio') {
    return `/media/${url}`;
  }
  
  // Default fallback
  return url.startsWith('/') ? url : `/${url}`;
};

export const EnhancedProjectMedia: React.FC<EnhancedProjectMediaProps> = ({ 
  media = [], 
  showPreview = true,
  allowCategorization = true 
}) => {
  // Convert to ProjectMediaItem format with URL resolution
  const mediaItems: ProjectMediaItem[] = media.map((item, index) => ({
    id: generateMediaId(item),
    ...item,
    url: resolveMediaUrl(item.url, item.type),
  }));

  const {
    viewMode,
    typeFilter,
    availableTypes,
    filteredMedia,
    setViewMode,
    setTypeFilter,
    resetFilters,
    totalCount,
    filteredCount,
    hasFilters
  } = useMediaFiltering({ media: mediaItems });

  if (media.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Media ({totalCount})</h3>
      </div>

      {(allowCategorization && hasFilters) && (
        <MediaFilters
          availableTypes={availableTypes}
          activeTypeFilter={typeFilter}
          viewMode={viewMode}
          totalCount={totalCount}
          filteredCount={filteredMedia.length}
          onTypeFilterChange={setTypeFilter}
          onViewModeChange={setViewMode}
        />
      )}

      {filteredMedia.length > 0 ? (
        viewMode === 'gallery' ? (
          <MediaGallery
            media={filteredMedia}
            viewMode="gallery"
            showPreview={showPreview}
          />
        ) : (
          <MediaGrid
            media={filteredMedia}
            viewMode={viewMode}
            showPreview={showPreview}
            showPlayButton={true}
            showAddToQueue={true}
          />
        )
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Inga mediafiler hittades{typeFilter !== 'all' ? ' för vald typ' : ''}.
          </p>
          {typeFilter !== 'all' && (
            <Button variant="outline" onClick={resetFilters}>
              Återställ filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
};