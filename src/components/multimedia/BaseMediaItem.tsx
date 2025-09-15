import React from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { getMediaIcon, getMediaTypeColor, isPlayableMedia } from '@/utils/mediaHelpers';
import { useMediaPlayer, useCurrentMedia } from '@/hooks/useMediaPlayer';
import { EnhancedImage } from './EnhancedImage';
import type { MediaItem } from '@/types/media';
import { cn } from '@/lib/utils';

interface BaseMediaItemProps {
  media: MediaItem;
  viewMode?: 'grid' | 'list';
  showPreview?: boolean;
  showPlayButton?: boolean;
  showAddToQueue?: boolean;
  className?: string;
}

export const BaseMediaItem: React.FC<BaseMediaItemProps> = ({ 
  media,
  viewMode = 'grid',
  showPreview = true,
  showPlayButton = true,
  showAddToQueue = true,
  className
}) => {
  const { addToQueue } = useMediaPlayer();
  const { playMedia, isMediaPlaying } = useCurrentMedia();
  
  const isPlayable = isPlayableMedia(media.type);
  const isCurrentlyPlaying = isMediaPlaying(media.url);
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlayable) {
      playMedia(media);
    }
  };
  
  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToQueue(media);
  };
  
  const containerClass = cn(
    "transition-all duration-300 rounded-lg overflow-hidden",
    viewMode === 'grid' 
      ? "border border-border hover:border-border/80 shadow-soft hover:shadow-medium" 
      : "border-l-4 border-l-primary/20 hover:border-l-primary/50 bg-card/30 hover:bg-card/60 pl-4 shadow-soft hover:shadow-medium",
    isCurrentlyPlaying && "ring-2 ring-primary shadow-glow border-primary/50",
    className
  );
  
  if (viewMode === 'grid') {
    return (
      <div className={containerClass}>
        {/* Enhanced preview section for grid view */}
        {showPreview && (media.type === 'image' || media.type === 'portfolio') && (
          <div className="aspect-video bg-muted overflow-hidden relative group">
            <EnhancedImage
              src={media.url}
              alt={media.title}
              className="w-full h-full"
              aspectRatio="video"
            />
            {isPlayable && showPlayButton && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <div className="bg-white/98 dark:bg-black/98 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300 border border-white/20">
                  {getMediaIcon(media.type, 'w-7 h-7 text-primary')}
                </div>
              </button>
            )}

            {/* Loading state indicator */}
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/80 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
              </div>
            </div>
          </div>
        )}

        <div className="p-5 flex-grow">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className={`flex-shrink-0 p-2.5 rounded-lg border shadow-sm ${getMediaTypeColor(media.type)} group-hover:shadow-md transition-all duration-300`}>
              {getMediaIcon(media.type)}
            </div>

            <div className="flex items-center gap-1">
              {showAddToQueue && isPlayable && (
                <button
                  onClick={handleAddToQueue}
                  className="btn-glow p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                  title="Lägg till i kö"
                >
                  <Plus className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </button>
              )}
              <a
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glow p-2 rounded-lg hover:bg-primary/10 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                onClick={(e) => e.stopPropagation()}
                style={{ transitionDelay: '0.05s' }}
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </a>
            </div>
          </div>

          <h4 className="font-semibold text-foreground group-hover:text-primary transition-all duration-300 mb-2 line-clamp-2">
            {media.title}
          </h4>

          {media.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {media.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-medium text-muted-foreground capitalize bg-muted/50 px-2 py-1 rounded-full">
              {media.type}
            </span>

            {isPlayable && showPlayButton && (
              <button
                onClick={handlePlayClick}
                className={cn(
                  "btn-glow px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-300 transform hover:scale-105",
                  isCurrentlyPlaying
                    ? "gradient-primary text-primary-foreground border-primary shadow-soft animate-pulse-glow"
                    : "bg-muted hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary hover:shadow-soft"
                )}
              >
                {isCurrentlyPlaying ? 'Spelar nu' : 'Spela'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // List view
  return (
    <div className={containerClass}>
      <div className={`flex-shrink-0 p-3 rounded-md border ${getMediaTypeColor(media.type)}`}>
        {getMediaIcon(media.type)}
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {media.title}
          </h4>

          <div className="flex items-center gap-1">
            {isPlayable && showPlayButton && (
              <button
                onClick={handlePlayClick}
                className={cn(
                  "px-2 py-1 text-xs rounded-md border transition-colors",
                  isCurrentlyPlaying
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-primary/10 hover:border-primary/20 text-muted-foreground hover:text-primary"
                )}
              >
                {isCurrentlyPlaying ? 'Spelar' : 'Spela'}
              </button>
            )}

            {showAddToQueue && isPlayable && (
              <button
                onClick={handleAddToQueue}
                className="p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                title="Lägg till i kö"
              >
                <Plus className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}

            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-muted transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {media.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {media.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-muted-foreground capitalize">
            {media.type}
          </span>

          {media.duration && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
