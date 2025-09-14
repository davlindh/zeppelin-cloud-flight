import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MediaErrorBoundary } from '@/components/ui/MediaErrorBoundary';
import { EnhancedImage } from '../../../components/multimedia/EnhancedImage';
import { EnhancedMediaPreview } from '../../../components/multimedia/EnhancedMediaPreview';
import { MediaGridSkeleton } from '../../../components/multimedia/MediaGridSkeleton';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import { 
  getMediaIcon, 
  getMediaTypeColor, 
  getMediaTypeName,
  isPlayableMedia,
  formatDuration 
} from '@/utils/mediaHelpers';
import { resolveMediaUrl, generateThumbnailUrl, getPlaceholderAsset } from '@/utils/assetHelpers';
import type { MediaItem } from '@/types/media';
import { cn } from '@/lib/utils';
import { Play, Plus, Download, Maximize2 } from 'lucide-react';

export interface UnifiedMediaGridProps {
  media: MediaItem[];
  viewMode?: 'grid' | 'list' | 'gallery';
  showPreview?: boolean;
  showPlayButton?: boolean;
  showAddToQueue?: boolean;
  showDownload?: boolean;
  className?: string;
  loading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  context?: 'project' | 'participant' | 'partner' | 'media';
}

export const UnifiedMediaGrid: React.FC<UnifiedMediaGridProps> = ({
  media,
  viewMode = 'grid',
  showPreview = true,
  showPlayButton = true,
  showAddToQueue = true,
  showDownload = false,
  className,
  loading = false,
  skeletonCount = 6,
  emptyMessage = 'Inga mediafiler hittades.',
  context = 'media'
}) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const { playMedia, addToQueue } = useMediaPlayer();

  useEffect(() => {
    if (media.length > 0) {
      const timer = setTimeout(() => setImagesLoaded(true), 300);
      return () => clearTimeout(timer);
    }
  }, [media.length]);

  const handleMediaClick = useCallback((mediaItem: MediaItem) => {
    if (showPreview) {
      setSelectedMedia(mediaItem);
      setPreviewOpen(true);
    }
  }, [showPreview]);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setSelectedMedia(null);
  }, []);

  // Show skeleton while loading
  if (loading || (!imagesLoaded && media.length > 0)) {
    return (
      <MediaGridSkeleton 
        count={skeletonCount}
        viewMode={viewMode === 'gallery' ? 'grid' : viewMode}
        className={className}
      />
    );
  }

  // Show empty state
  if (media.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Gallery view with type-specific sections
  if (viewMode === 'gallery') {
    const imageMedia = media.filter(item => item.type === 'image' || item.type === 'portfolio');
    const videoMedia = media.filter(item => item.type === 'video');
    const audioMedia = media.filter(item => item.type === 'audio');
    const otherMedia = media.filter(item => !['image', 'portfolio', 'video', 'audio'].includes(item.type));

    return (
      <div className={cn('space-y-8', className)}>
        {/* Images Section */}
        {imageMedia.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Bilder ({imageMedia.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageMedia.map((item, index) => (
                <MediaErrorBoundary key={item.id || `image-${index}`}>
                  <div 
                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-muted"
                    onClick={() => handleMediaClick(item)}
                  >
                    <EnhancedImage
                      src={resolveMediaUrl(item.url, item.type, context)}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Maximize2 className="w-8 h-8 text-white mb-2" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    </div>
                  </div>
                </MediaErrorBoundary>
              ))}
            </div>
          </section>
        )}

        {/* Videos Section */}
        {videoMedia.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Videor ({videoMedia.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videoMedia.map((item, index) => (
                <MediaErrorBoundary key={item.id || `video-${index}`}>
                  <VideoMediaItem
                    media={item}
                    onMediaClick={handleMediaClick}
                    context={context}
                    showPlayButton={showPlayButton}
                    showAddToQueue={showAddToQueue}
                    showDownload={showDownload}
                  />
                </MediaErrorBoundary>
              ))}
            </div>
          </section>
        )}

        {/* Audio Section */}
        {audioMedia.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Ljud ({audioMedia.length})</h3>
            <div className="space-y-2">
              {audioMedia.map((item, index) => (
                <MediaErrorBoundary key={item.id || `audio-${index}`}>
                  <BaseMediaItem
                    media={item}
                    viewMode="list"
                    showPreview={showPreview}
                    showPlayButton={showPlayButton}
                    showAddToQueue={showAddToQueue}
                    context={context}
                    onMediaClick={handleMediaClick}
                  />
                </MediaErrorBoundary>
              ))}
            </div>
          </section>
        )}

        {/* Other Media Section */}
        {otherMedia.length > 0 && (
          <section>
            <h3 className="text-lg font-semibold mb-4">Andra filer ({otherMedia.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherMedia.map((item, index) => (
                <MediaErrorBoundary key={item.id || `other-${index}`}>
                  <BaseMediaItem
                    media={item}
                    viewMode="grid"
                    showPreview={showPreview}
                    showPlayButton={showPlayButton}
                    showAddToQueue={showAddToQueue}
                    context={context}
                    onMediaClick={handleMediaClick}
                  />
                </MediaErrorBoundary>
              ))}
            </div>
          </section>
        )}

        {/* Media Preview Modal */}
        {selectedMedia && (
          <EnhancedMediaPreview
            media={selectedMedia}
            isOpen={previewOpen}
            onClose={closePreview}
          />
        )}
      </div>
    );
  }

  // Grid and List views
  const containerClass = cn(
    viewMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
      : "space-y-3",
    className
  );
  
  return (
    <div className={containerClass}>
      {media.map((item, index) => (
        <MediaErrorBoundary key={item.id || `${item.url}-${index}`}>
          <BaseMediaItem
            media={item}
            viewMode={viewMode as 'grid' | 'list'}
            showPreview={showPreview}
            showPlayButton={showPlayButton}
            showAddToQueue={showAddToQueue}
            context={context}
            onMediaClick={handleMediaClick}
          />
        </MediaErrorBoundary>
      ))}

      {/* Media Preview Modal */}
      {selectedMedia && (
        <EnhancedMediaPreview
          media={selectedMedia}
          isOpen={previewOpen}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

// Video Media Item Component
interface VideoMediaItemProps {
  media: MediaItem;
  onMediaClick: (media: MediaItem) => void;
  context: 'project' | 'participant' | 'partner' | 'media';
  showPlayButton?: boolean;
  showAddToQueue?: boolean;
  showDownload?: boolean;
}

const VideoMediaItem: React.FC<VideoMediaItemProps> = ({
  media,
  onMediaClick,
  context,
  showPlayButton,
  showAddToQueue,
  showDownload
}) => {
  const { playMedia, addToQueue } = useMediaPlayer();

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    playMedia(media);
  }, [playMedia, media]);

  const handleAddToQueue = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(media);
  }, [addToQueue, media]);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const url = resolveMediaUrl(media.url, media.type, context);
    const link = document.createElement('a');
    link.href = url;
    link.download = media.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [media, context]);

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => onMediaClick(media)}>
      <CardContent className="p-0">
        <div className="relative aspect-video rounded-t-lg overflow-hidden bg-muted">
          <img
            src={generateThumbnailUrl(media.url, media.type)}
            alt={media.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderAsset('video', context);
            }}
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            {showPlayButton && (
              <Button
                size="lg"
                className="bg-white/20 hover:bg-white/40 text-white border-white/40 backdrop-blur-sm"
                onClick={handlePlay}
              >
                <Play className="w-6 h-6" />
              </Button>
            )}
          </div>
          {media.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(media.duration)}
            </div>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-medium mb-1 line-clamp-2">{media.title}</h4>
          {media.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{media.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <Badge variant="secondary" className={getMediaTypeColor(media.type)}>
              {getMediaIcon(media.type, 'w-3 h-3')}
              <span className="ml-1">{getMediaTypeName(media.type)}</span>
            </Badge>
            <div className="flex gap-2">
              {showAddToQueue && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddToQueue}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
              {showDownload && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Base media item component for individual items
interface BaseMediaItemProps {
  media: MediaItem;
  viewMode: 'grid' | 'list';
  showPreview?: boolean;
  showPlayButton?: boolean;
  showAddToQueue?: boolean;
  context?: 'project' | 'participant' | 'partner' | 'media';
  onMediaClick?: (media: MediaItem) => void;
}

const BaseMediaItem: React.FC<BaseMediaItemProps> = ({
  media,
  viewMode,
  showPreview = true,
  showPlayButton = true, 
  showAddToQueue = true,
  context = 'media',
  onMediaClick
}) => {
  const { playMedia, addToQueue } = useMediaPlayer();

  const handleMediaClick = useCallback(() => {
    if (onMediaClick) {
      onMediaClick(media);
    }
  }, [onMediaClick, media]);

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayableMedia(media.type)) {
      playMedia(media);
    } else {
      window.open(resolveMediaUrl(media.url, media.type, context), '_blank');
    }
  }, [playMedia, media, context]);

  const handleAddToQueue = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(media);
  }, [addToQueue, media]);

  if (viewMode === 'grid') {
    return (
      <Card 
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 h-full"
        onClick={handleMediaClick}
      >
        <CardContent className="p-0 h-full flex flex-col">
          <div className="relative aspect-video rounded-t-lg overflow-hidden bg-muted flex-shrink-0">
            <EnhancedImage
              src={generateThumbnailUrl(media.url, media.type)}
              alt={media.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {showPlayButton && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                <Button
                  size="lg"
                  className="bg-white/20 hover:bg-white/40 text-white border-white/40 backdrop-blur-sm"
                  onClick={handlePlay}
                >
                  {isPlayableMedia(media.type) ? <Play className="w-6 h-6" /> : getMediaIcon(media.type, 'w-6 h-6')}
                </Button>
              </div>
            )}
            {showAddToQueue && isPlayableMedia(media.type) && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={handleAddToQueue}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="p-4 flex-grow flex flex-col">
            <h4 className="font-medium mb-1 line-clamp-2 flex-grow">{media.title}</h4>
            {media.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{media.description}</p>
            )}
            <div className="flex items-center justify-between mt-auto">
              <Badge variant="secondary" className={getMediaTypeColor(media.type)}>
                {getMediaIcon(media.type, 'w-3 h-3')}
                <span className="ml-1">{getMediaTypeName(media.type)}</span>
              </Badge>
              {media.duration && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(media.duration)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view
  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-300"
      onClick={handleMediaClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {getMediaIcon(media.type, 'w-8 h-8')}
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="font-medium truncate">{media.title}</h4>
            {media.description && (
              <p className="text-sm text-muted-foreground truncate">{media.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={getMediaTypeColor(media.type)}>
                {getMediaTypeName(media.type)}
              </Badge>
              {media.duration && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(media.duration)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {showPlayButton && (
              <Button
                size="sm"
                variant="ghost"
                className="opacity-60 group-hover:opacity-100 transition-opacity"
                onClick={handlePlay}
              >
                {isPlayableMedia(media.type) ? <Play className="w-4 h-4" /> : getMediaIcon(media.type, 'w-4 h-4')}
              </Button>
            )}
            {showAddToQueue && isPlayableMedia(media.type) && (
              <Button
                size="sm"
                variant="ghost"
                className="opacity-60 group-hover:opacity-100 transition-opacity"
                onClick={handleAddToQueue}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
