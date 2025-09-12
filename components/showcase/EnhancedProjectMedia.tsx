import React from 'react';
import { MediaFilters, MediaGrid, MediaGallery } from '../multimedia';
import { Button } from '@/components/ui/button';
import type { ProjectMediaItem } from '@/types/media';
import { generateMediaId } from '@/utils/mediaHelpers';
import { useMediaFiltering } from '@/hooks/useMediaFiltering';

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

export const EnhancedProjectMedia: React.FC<EnhancedProjectMediaProps> = ({ 
  media = [], 
  showPreview = true,
  allowCategorization = true 
}) => {
  // Convert to ProjectMediaItem format
  const mediaItems: ProjectMediaItem[] = media.map((item, index) => ({
    id: generateMediaId(item),
    ...item,
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