import React from 'react';
import { MediaCard } from './MediaCard';
import type { MediaLibraryItem } from '@/types/mediaLibrary';
import { cn } from '@/lib/utils';

interface MediaGridProps {
  media: MediaLibraryItem[];
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  onPreview?: (item: MediaLibraryItem) => void;
  showCheckboxes?: boolean;
  compact?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
  loading?: boolean;
  emptyMessage?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  selectedIds,
  onSelect,
  onPreview,
  showCheckboxes = false,
  compact = false,
  columns = 4,
  loading = false,
  emptyMessage = 'No media found',
}) => {
  if (loading) {
    return (
      <div className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        columns === 5 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        columns === 6 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
      )}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse bg-muted rounded-lg',
              compact ? 'h-32' : 'h-64'
            )}
          />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid gap-4',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      columns === 5 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      columns === 6 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
    )}>
      {media.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          selected={selectedIds?.has(item.id)}
          onSelect={onSelect}
          onPreview={onPreview}
          showCheckbox={showCheckboxes}
          compact={compact}
        />
      ))}
    </div>
  );
};
