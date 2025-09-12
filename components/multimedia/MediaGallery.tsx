import React, { useState } from 'react';
import { Maximize2, Play, Eye } from 'lucide-react';
import { EnhancedMediaPreview } from './EnhancedMediaPreview';
import { BaseMediaItem } from './BaseMediaItem';
import type { MediaItem } from '@/types/media';
import { cn } from '@/lib/utils';

interface MediaGalleryProps {
  media: MediaItem[];
  viewMode?: 'grid' | 'list' | 'gallery';
  showPreview?: boolean;
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  viewMode = 'gallery',
  showPreview = true,
  className
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleMediaClick = (mediaItem: MediaItem) => {
    if (showPreview) {
      setSelectedMedia(mediaItem);
      setPreviewOpen(true);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setSelectedMedia(null);
  };

  if (viewMode === 'grid' || viewMode === 'list') {
    return (
      <>
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-3",
          className
        )}>
          {media.map((item, index) => (
            <div 
              key={item.id || `${item.url}-${index}`}
              onClick={() => handleMediaClick(item)}
              className="cursor-pointer"
            >
              <BaseMediaItem
                media={item}
                viewMode={viewMode}
                showPreview={showPreview}
                showPlayButton={true}
                showAddToQueue={true}
              />
            </div>
          ))}
        </div>

        {selectedMedia && (
          <EnhancedMediaPreview
            media={selectedMedia}
            isOpen={previewOpen}
            onClose={closePreview}
          />
        )}
      </>
    );
  }

  // Gallery view with enhanced preview capabilities
  const imageMedia = media.filter(item => item.type === 'image' || item.type === 'portfolio');
  const videoMedia = media.filter(item => item.type === 'video');
  const audioMedia = media.filter(item => item.type === 'audio');
  const otherMedia = media.filter(item => !['image', 'portfolio', 'video', 'audio'].includes(item.type));

  return (
    <div className={cn("space-y-8", className)}>
      {/* Image Gallery */}
      {imageMedia.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Bilder och Portfolio ({imageMedia.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageMedia.map((item, index) => (
              <div
                key={item.id || `img-${index}`}
                onClick={() => handleMediaClick(item)}
                className="group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer media-item reveal-scale stagger-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <Maximize2 className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-medium truncate drop-shadow-sm">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video Gallery */}
      {videoMedia.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Videor ({videoMedia.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoMedia.map((item, index) => (
              <div
                key={item.id || `video-${index}`}
                onClick={() => handleMediaClick(item)}
                className="group relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer media-item reveal-scale stagger-2"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20"></div>
                    <Play className="w-16 h-16 text-primary-foreground drop-shadow-lg animate-pulse-glow" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <div className="bg-white/95 dark:bg-black/95 backdrop-blur-sm rounded-full p-4 shadow-xl border border-white/20">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold truncate drop-shadow-sm">{item.title}</p>
                  {item.duration && (
                    <p className="text-white/90 text-sm font-medium drop-shadow-sm">
                      {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Audio */}
      {audioMedia.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Ljud ({audioMedia.length})</h3>
          <div className="space-y-3">
            {audioMedia.map((item, index) => (
              <BaseMediaItem
                key={item.id || `audio-${index}`}
                media={item}
                viewMode="list"
                showPreview={true}
                showPlayButton={true}
                showAddToQueue={true}
                className="cursor-pointer"
              />
            ))}
          </div>
        </section>
      )}

      {/* Other Media Types */}
      {otherMedia.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Andra filer ({otherMedia.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherMedia.map((item, index) => (
              <div
                key={item.id || `other-${index}`}
                onClick={() => handleMediaClick(item)}
                className="cursor-pointer"
              >
                <BaseMediaItem
                  media={item}
                  viewMode="grid"
                  showPreview={true}
                  showPlayButton={false}
                  showAddToQueue={false}
                />
              </div>
            ))}
          </div>
        </section>
      )}

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
