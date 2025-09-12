import React, { useState } from 'react';
import { Maximize2, Play, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
    <div className={cn("space-y-10 md:space-y-12", className)}>
      {/* Image Gallery */}
      {imageMedia.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-primary">
                <Eye className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>Bilder och Portfolio</span>
              <Badge variant="secondary" className="ml-2">{imageMedia.length}</Badge>
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {imageMedia.map((item, index) => (
              <div
                key={item.id || `img-${index}`}
                onClick={() => handleMediaClick(item)}
                className="group media-item cursor-pointer reveal-scale stagger-1 aspect-square"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="bg-background/95 backdrop-blur-sm rounded-full p-3 shadow-elegant border border-border/20">
                      <Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 md:p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-medium text-sm md:text-base truncate drop-shadow-sm leading-tight">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video Gallery */}
      {videoMedia.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-secondary">
                <Play className="w-5 h-5 text-secondary-foreground" />
              </div>
              <span>Videor</span>
              <Badge variant="secondary" className="ml-2">{videoMedia.length}</Badge>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {videoMedia.map((item, index) => (
              <div
                key={item.id || `video-${index}`}
                onClick={() => handleMediaClick(item)}
                className="group media-item cursor-pointer reveal-scale stagger-2 aspect-video"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20"></div>
                    <Play className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground drop-shadow-lg animate-pulse-glow" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <div className="bg-background/95 backdrop-blur-sm rounded-full p-3 md:p-4 shadow-elegant border border-border/20">
                      <Play className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 md:p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-semibold text-sm md:text-base truncate drop-shadow-sm leading-tight">{item.title}</p>
                  {item.duration && (
                    <p className="text-white/90 text-xs md:text-sm font-medium drop-shadow-sm mt-1">
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
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-accent">
                <Play className="w-5 h-5 text-accent-foreground" />
              </div>
              <span>Ljud</span>
              <Badge variant="secondary" className="ml-2">{audioMedia.length}</Badge>
            </h3>
          </div>
          <div className="space-y-3 md:space-y-4">
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
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg gradient-muted">
                <Eye className="w-5 h-5 text-muted-foreground" />
              </div>
              <span>Andra filer</span>
              <Badge variant="secondary" className="ml-2">{otherMedia.length}</Badge>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
