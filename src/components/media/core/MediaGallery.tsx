import React from 'react';
import { RichMediaPreview } from './RichMediaPreview';
import { MediaGridSkeleton } from './MediaGridSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Download, Plus, ImageIcon } from 'lucide-react';
import { getMediaIcon, getMediaTypeColor, isPlayableMedia } from '@/utils/media';
import { cn } from '@/lib/utils';

// Simple card component for basic media galleries
const SimpleMediaCard: React.FC<{
  item: {
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    title: string;
    description?: string;
    url: string;
    thumbnail?: string;
  };
  onPlay?: () => void;
  onAddToQueue?: () => void;
  onDownload?: () => void;
}> = ({ item, onPlay, onAddToQueue, onDownload }) => {
  const isPlayable = isPlayableMedia(item.type);

  return (
    <Card className="card-enhanced border-0 shadow-soft hover:shadow-elegant transition-all duration-300 group overflow-hidden">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-xs text-foreground truncate group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn("flex-shrink-0", getMediaTypeColor(item.type))}
            >
              {getMediaIcon(item.type, 'w-3 h-3')}
              <span className="ml-1 text-xs uppercase">{item.type}</span>
            </Badge>
          </div>

          <RichMediaPreview
            item={{
              ...item,
              public_url: item.url,
              thumbnail_url: item.thumbnail,
            } as any}
            className="aspect-video"
          />

          <div className="flex items-center gap-1">
            {isPlayable && (
              <>
                <Button
                  size="sm"
                  onClick={onPlay}
                  variant="outline"
                  className="flex-1 text-xs px-2"
                >
                  {getMediaIcon(item.type, 'w-3 h-3 mr-1')}
                  Spela
                </Button>
                {onAddToQueue && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onAddToQueue}
                    className="px-1"
                    title="Lägg till i kö"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={onDownload}
              className="px-1"
              title="Ladda ner"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
}

interface MediaGalleryProps {
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

export const MediaGallery: React.FC<MediaGalleryProps> = ({
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
        <SimpleMediaCard
          key={item.id}
          item={item}
          onPlay={() => onPlay?.(item)}
          onAddToQueue={() => onAddToQueue?.(item)}
          onDownload={() => onDownload?.(item)}
        />
      ))}
    </div>
  );
};
