import React from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { getMediaIcon, getMediaTypeColor, isPlayableMedia } from '@/utils/mediaHelpers';
import { useMediaPlayer, useCurrentMedia } from '@/hooks/useMediaPlayer';
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
    "group border border-border rounded-lg hover:shadow-md hover:border-primary/20 transition-all duration-200",
    viewMode === 'grid' ? 'flex flex-col' : 'flex items-start gap-4 p-4',
    isCurrentlyPlaying && "ring-2 ring-primary/50",
    className
  );
  
  if (viewMode === 'grid') {
    return (
      <div className={containerClass}>
        {/* Preview section for grid view */}
        {showPreview && (media.type === 'image' || media.type === 'portfolio') && (
          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
            <img 
              src={media.url} 
              alt={media.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            {isPlayable && showPlayButton && (
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {getMediaIcon(media.type, 'w-12 h-12 text-white')}
              </button>
            )}
          </div>
        )}
        
        <div className="p-4 flex-grow">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className={`flex-shrink-0 p-2 rounded-md border ${getMediaTypeColor(media.type)}`}>
              {getMediaIcon(media.type)}
            </div>
            
            <div className="flex items-center gap-1">
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
          
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
            {media.title}
          </h4>
          
          {media.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {media.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground capitalize">
              {media.type}
            </span>
            
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