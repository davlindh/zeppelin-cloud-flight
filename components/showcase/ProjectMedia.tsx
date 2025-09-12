import React, { useState } from 'react';
import { MediaGrid } from '../multimedia/MediaGrid';
import { MediaFilters } from '../multimedia/MediaFilters';
import type { ProjectMediaItem } from '@/types/media';
import { generateMediaId } from '@/utils/mediaHelpers';

interface ProjectMediaProps {
  media?: Array<{
    type: 'video' | 'audio' | 'image' | 'document';
    url: string;
    title: string;
    description?: string;
  }>;
}

export const ProjectMedia: React.FC<ProjectMediaProps> = ({ media = [] }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<string>('all');
  
  if (media.length === 0) {
    return null;
  }

  // Convert to ProjectMediaItem format
  const mediaItems: ProjectMediaItem[] = media.map((item, index) => ({
    id: generateMediaId(item),
    ...item,
  }));

  // Filter media
  const filteredMedia = filter === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.type === filter);

  // Get available types for filter
  const availableTypes = [...new Set(mediaItems.map(item => item.type))];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Media & Material</h3>
      
      {/* Filters */}
      {availableTypes.length > 1 && (
        <MediaFilters
          availableTypes={availableTypes}
          activeTypeFilter={filter}
          viewMode={viewMode}
          totalCount={mediaItems.length}
          filteredCount={filteredMedia.length}
          onTypeFilterChange={setFilter}
          onViewModeChange={setViewMode}
        />
      )}
      
      {/* Media Grid */}
      <MediaGrid
        media={filteredMedia}
        viewMode={viewMode}
        showPreview={true}
        showPlayButton={true}
        showAddToQueue={true}
      />
      
      {filteredMedia.length === 0 && filter !== 'all' && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Inga mediafiler av vald typ hittades.</p>
          <button 
            onClick={() => setFilter('all')}
            className="text-primary hover:underline mt-1"
          >
            Visa alla mediafiler
          </button>
        </div>
      )}
    </div>
  );
};