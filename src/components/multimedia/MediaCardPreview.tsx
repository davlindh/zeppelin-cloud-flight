import React from 'react';
import { Play, Volume2, Image, FileText, Eye, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import { getMediaIcon, getMediaTypeColor, isPlayableMedia, formatDuration } from '@/utils/mediaHelpers';
import type { MediaItem } from '@/types/media';
import { cn } from '@/lib/utils';

interface MediaCardPreviewProps {
  media: MediaItem[];
  className?: string;
  maxItems?: number;
  showPlayButton?: boolean;
  showDownload?: boolean;
  compact?: boolean;
}

export const MediaCardPreview: React.FC<MediaCardPreviewProps> = ({
  media,
  className,
  maxItems = 4,
  showPlayButton = true,
  showDownload = false,
  compact = false
}) => {
  const { playMedia, addToQueue } = useMediaPlayer();

  if (!media || media.length === 0) return null;

  const displayMedia = media.slice(0, maxItems);
  const remainingCount = Math.max(0, media.length - maxItems);

  const handlePlayMedia = (mediaItem: MediaItem) => {
    if (isPlayableMedia(mediaItem.type)) {
      playMedia(mediaItem);
      // Add remaining playable media to queue
      const playableMedia = media.filter(m => isPlayableMedia(m.type) && m.url !== mediaItem.url);
      if (playableMedia.length > 0) {
        addToQueue(playableMedia);
      }
    }
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex -space-x-1">
          {displayMedia.slice(0, 3).map((item, index) => (
            <div
              key={item.id || `${item.url}-${index}`}
              className={cn(
                'w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs',
                getMediaTypeColor(item.type)
              )}
            >
              {getMediaIcon(item.type, 'w-3 h-3')}
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {media.length} media{media.length !== 1 ? 'filer' : 'fil'}
        </div>
        
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  }

  // Find the best preview image
  const previewImage = media.find(m => m.type === 'image') || displayMedia[0];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main preview */}
      {previewImage && (
        <div className="relative group">
          <OptimizedImage
            src={previewImage.url}
            alt={previewImage.title}
            className="rounded-lg"
            aspectRatio="16/9"
            objectFit="cover"
          />
          
          {/* Media count overlay */}
          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1 backdrop-blur-sm">
            {getMediaIcon(previewImage.type, 'w-3 h-3')}
            {media.length}
          </div>

          {/* Play button overlay */}
          {isPlayableMedia(previewImage.type) && showPlayButton && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-lg">
              <Button
                size="lg"
                className="rounded-full bg-white/95 hover:bg-white text-black shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300"
                onClick={() => handlePlayMedia(previewImage)}
              >
                <Play className="w-6 h-6 ml-1" />
              </Button>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 px-2 bg-white/90 hover:bg-white text-black"
              onClick={() => window.open(previewImage.url, '_blank')}
            >
              <Eye className="w-3 h-3" />
            </Button>
            
            {showDownload && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2 bg-white/90 hover:bg-white text-black"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewImage.url;
                  link.download = previewImage.title;
                  link.click();
                }}
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Media list */}
      {displayMedia.length > 1 && (
        <div className="grid grid-cols-2 gap-2">
          {displayMedia.slice(1).map((item, index) => (
            <div
              key={item.id || `${item.url}-${index + 1}`}
              className="group cursor-pointer bg-card rounded-lg p-3 border hover:border-primary/20 transition-all duration-300 hover:shadow-md"
              onClick={() => handlePlayMedia(item)}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  getMediaTypeColor(item.type)
                )}>
                  {getMediaIcon(item.type, 'w-4 h-4')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{item.type}</span>
                    {item.duration && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(item.duration)}</span>
                      </>
                    )}
                  </div>
                </div>

                {isPlayableMedia(item.type) && (
                  <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remaining count */}
      {remainingCount > 0 && (
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            +{remainingCount} fler mediafiler
          </Badge>
        </div>
      )}
    </div>
  );
};