import { useState, useMemo } from 'react';
import type { MediaItem } from '@/types/media';

interface UseMediaFilteringProps {
  media: MediaItem[];
}

export const useMediaFiltering = ({ media }: UseMediaFilteringProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Get available types for filter
  const availableTypes = useMemo(() => 
    [...new Set(media.map(item => item.type))],
    [media]
  );

  // Filter media by type
  const filteredMedia = useMemo(() => 
    typeFilter === 'all' 
      ? media 
      : media.filter(item => item.type === typeFilter),
    [media, typeFilter]
  );

  const resetFilters = () => {
    setTypeFilter('all');
  };

  return {
    // State
    viewMode,
    typeFilter,
    availableTypes,
    filteredMedia,
    
    // Actions
    setViewMode,
    setTypeFilter,
    resetFilters,
    
    // Computed
    totalCount: media.length,
    filteredCount: filteredMedia.length,
    hasFilters: availableTypes.length > 1,
  };
};