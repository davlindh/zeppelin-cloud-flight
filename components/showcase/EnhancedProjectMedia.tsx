import React from 'react';
import { MediaGrid } from '../multimedia/MediaGrid';
import { MediaFilters } from '../multimedia/MediaFilters';
import type { ProjectMediaItem } from '@/types/media';
import { generateMediaId } from '@/utils/mediaHelpers';
import { useMediaFiltering } from '@/hooks/useMediaFiltering';

interface EnhancedProjectMediaProps {
  media?: Array<{
    type: 'video' | 'audio' | 'image' | 'document';
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
      {/* Header */}
      <h3 className="text-lg font-semibold text-foreground">Media & Material</h3>
      
      {/* Filters */}
      {allowCategorization && hasFilters && (
        <MediaFilters
          availableTypes={availableTypes}
          activeTypeFilter={typeFilter}
          viewMode={viewMode}
          totalCount={totalCount}
          filteredCount={filteredCount}
          onTypeFilterChange={setTypeFilter}
          onViewModeChange={setViewMode}
        />
      )}
      
      {/* Media Grid */}
      <MediaGrid
        media={filteredMedia}
        viewMode={viewMode}
        showPreview={showPreview}
        showPlayButton={true}
        showAddToQueue={true}
      />
      
      {filteredCount === 0 && typeFilter !== 'all' && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Inga mediafiler av vald typ hittades.</p>
          <button 
            onClick={resetFilters}
            className="text-primary hover:underline mt-1"
          >
            Visa alla mediafiler
          </button>
        </div>
      )}
    </div>
  );
};