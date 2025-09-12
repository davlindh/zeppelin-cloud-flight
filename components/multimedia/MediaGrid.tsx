import React from 'react';
import { BaseMediaItem } from './BaseMediaItem';
import type { MediaItem } from '@/types/media';
import { cn } from '@/lib/utils';

interface MediaGridProps {
  media: MediaItem[];
  viewMode?: 'grid' | 'list';
  showPreview?: boolean;
  showPlayButton?: boolean;
  showAddToQueue?: boolean;
  className?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ 
  media,
  viewMode = 'grid',
  showPreview = true,
  showPlayButton = true,
  showAddToQueue = true,
  className
}) => {
  if (media.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Inga mediafiler hittades.</p>
      </div>
    );
  }
  
  const containerClass = cn(
    viewMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
      : "space-y-3",
    className
  );
  
  return (
    <div className={containerClass}>
      {media.map((item, index) => (
        <BaseMediaItem
          key={item.id || `${item.url}-${index}`}
          media={item}
          viewMode={viewMode}
          showPreview={showPreview}
          showPlayButton={showPlayButton}
          showAddToQueue={showAddToQueue}
        />
      ))}
    </div>
  );
};