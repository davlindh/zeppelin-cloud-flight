import React from 'react';
import { MediaCardSimple } from './MediaCardSimple';
import { MediaGridSkeleton } from './MediaGridSkeleton';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  isLegacy?: boolean;
}

interface MediaGridProps {
  media: MediaItem[];
  viewMode?: 'grid' | 'list';
  loading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  className?: string;
  onPlay?: (item: MediaItem) => void;
  onAddToQueue?: (item: MediaItem) => void;
  onDownload?: (item: MediaItem) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  viewMode = 'grid',
  loading = false,
  skeletonCount = 6,
  emptyMessage = 'Inga mediafiler hittades.',
  className,
  onPlay,
  onAddToQueue,
  onDownload,
}) => {
  if (loading) {
    return (
      <MediaGridSkeleton
        count={skeletonCount}
        viewMode={viewMode}
        className={className}
      />
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const containerClass = cn(
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'space-y-3',
    className
  );

  return (
    <div className={containerClass}>
      {media.map((item) => (
        <MediaCardSimple
          key={item.id}
          {...item}
          onPlay={() => onPlay?.(item)}
          onAddToQueue={() => onAddToQueue?.(item)}
          onDownload={() => onDownload?.(item)}
        />
      ))}
    </div>
  );
};
