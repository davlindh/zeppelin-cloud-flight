import React, { useMemo } from 'react';
import { MediaGrid } from '@/components/media/core/MediaGrid';
import { MediaFilters } from '@/components/media/core/MediaFilters';
import { useMediaFiltering } from '@/hooks/useMediaFiltering';
import type { UnifiedMediaItem } from '@/types/unified-media';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { generateMediaId } from '@/utils/mediaHelpers';
import { getImageUrl } from '@/utils/imageUtils';

interface ProjectMediaDisplayProps {
  media?: Array<{
    type: string;
    url: string;
    title: string;
    description?: string;
    project_id?: string;
  }>;
  showPreview?: boolean;
  allowCategorization?: boolean;
}

export const ProjectMediaDisplay: React.FC<ProjectMediaDisplayProps> = ({
  media = [], 
  showPreview = true,
  allowCategorization = true 
}) => {
  // Transform media into UnifiedMediaItem format with optimized URLs
  const unifiedMedia: UnifiedMediaItem[] = useMemo(() => 
    media.map((item) => ({
      id: generateMediaId(item),
      type: item.type as UnifiedMediaItem['type'],
      url: getImageUrl(item.url), // Optimize URL handling
      title: item.title,
      description: item.description,
    })), [media]
  );

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
  } = useMediaFiltering({ media: unifiedMedia });

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
        <div className="text-sm text-muted-foreground">
          Visar {filteredMedia.length} av {totalCount} objekt
        </div>
      )}

      {filteredMedia.length > 0 ? (
        <MediaGrid
          media={filteredMedia.map(item => ({
            ...item,
            type: item.type as 'image' | 'video' | 'audio' | 'document'
          }))}
          viewMode={gridViewMode}
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
