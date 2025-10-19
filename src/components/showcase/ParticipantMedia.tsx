import React, { useState } from 'react';
import { User, Calendar } from 'lucide-react';
import { MediaGrid } from '@/components/media/core/MediaGrid';
import { MediaFilters } from '@/components/media/core/MediaFilters';
import { getCategoryIcon, getCategoryColor, getCategoryLabel, generateMediaId } from '@/utils/mediaHelpers';
import type { MediaCategory, UnifiedMediaItem } from '@/types/unified-media';

interface ParticipantMediaProps {
  media?: Array<{
    type: 'portfolio' | 'video' | 'audio' | 'document' | 'image';
    category: MediaCategory;
    url: string;
    title: string;
    description?: string;
    year?: string;
  }>;
  participantName?: string;
}

export const ParticipantMedia: React.FC<ParticipantMediaProps> = ({
  media = [],
  participantName = "Deltagare"
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'gallery'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  if (media.length === 0) {
    return null;
  }

  // Convert to unified media format
  const mediaItems: UnifiedMediaItem[] = media.map((item, index) => ({
    id: generateMediaId(item),
    type: item.type,
    url: item.url,
    title: item.title,
    description: item.description,
    category: item.category,
    year: item.year,
  }));

  // Filter media
  const filteredMedia = mediaItems.filter(item => {
    const typeMatch = typeFilter === 'all' || item.type === typeFilter;
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  // Get available filters
  const availableTypes = [...new Set(mediaItems.map(item => item.type))];
  const availableCategories = [...new Set(mediaItems.map(item => item.category))];

  // Group by category for better organization
  const groupedMedia = filteredMedia.reduce((acc, item) => {
    if (!acc[item.category || 'other']) {
      acc[item.category || 'other'] = [];
    }
    acc[item.category || 'other'].push(item);
    return acc;
  }, {} as Record<string, UnifiedMediaItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          {participantName}s Portfolio & Media
        </h3>
      </div>
      
      {/* Show filter count */}
      {(availableTypes.length > 1 || availableCategories.length > 1) && (
        <div className="text-sm text-muted-foreground">
          Visar {filteredMedia.length} av {mediaItems.length} objekt
        </div>
      )}
      
      {/* Grouped Media by Category */}
      {Object.entries(groupedMedia).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            {getCategoryIcon(category as MediaCategory, 'w-4 h-4')}
            <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getCategoryColor(category as MediaCategory)}`}>
              {getCategoryLabel(category as MediaCategory)}
            </span>
            <span className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'objekt' : 'objekt'}
            </span>
          </div>
          
          <MediaGrid
            media={items.map(item => ({
              ...item,
              type: item.type as 'image' | 'video' | 'audio' | 'document'
            }))}
            viewMode={viewMode === 'gallery' ? 'grid' : viewMode}
          />
        </div>
      ))}
      
      {filteredMedia.length === 0 && (typeFilter !== 'all' || categoryFilter !== 'all') && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Inga mediafiler matchade filtren.</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <button 
              onClick={() => setTypeFilter('all')}
              className="text-primary hover:underline"
            >
              Återställ typfilter
            </button>
            <span>•</span>
            <button 
              onClick={() => setCategoryFilter('all')}
              className="text-primary hover:underline"
            >
              Återställ kategorifilter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
