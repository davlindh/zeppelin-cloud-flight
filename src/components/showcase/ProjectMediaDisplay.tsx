import React from 'react';
import { MediaFilters } from '../multimedia';
import { UnifiedMediaGrid } from '@/components/multimedia/UnifiedMediaGrid';
import { Button } from '@/components/ui/button';
import type { ProjectMediaItem, MediaType } from '@/types/media';
import type { UnifiedMediaItem } from '@/types/unified-media';
import { generateMediaId } from '@/utils/mediaHelpers';
import { useMediaFiltering } from '@/hooks/useMediaFiltering';
import { resolveMediaUrl } from '@/utils/assetHelpers';

interface ProjectMediaDisplayProps {
  media?: Array<{
    type: 'video' | 'audio' | 'image' | 'document' | 'pdf' | 'presentation' | 'archive' | 'code' | '3d' | 'portfolio';
    url: string;
    title: string;
    description?: string;
  }>;
  showPreview?: boolean;
  allowCategorization?: boolean;
}

export const ProjectMediaDisplay: React.FC<ProjectMediaDisplayProps> = ({
  media = [], 
  showPreview = true,
  allowCategorization = true 
}) => {
  // Convert to UnifiedMediaItem format with centralized URL resolution
  const mediaItems: UnifiedMediaItem[] = media.map((item, index) => ({
    id: generateMediaId(item) || `project-media-${index}`,
    type: item.type,
    url: resolveMediaUrl(item.url, item.type, 'project'),
    title: item.title,
    description: item.description,
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

  // Convert viewMode to match UnifiedMediaGrid's expected type
  const gridViewMode = viewMode === 'gallery' ? 'grid' : viewMode;

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
        <UnifiedMediaGrid
          media={filteredMedia as UnifiedMediaItem[]}
          viewMode={gridViewMode}
          showPreview={showPreview}
          className="mt-4"
        />
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
