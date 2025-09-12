import React, { useState, useCallback } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  showLoader?: boolean;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'landscape';
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/public/images/ui/placeholder-project.jpg',
  showLoader = true,
  aspectRatio = 'video',
  lazy = true,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const aspectRatioClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setHasError(true);
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  return (
    <div className={cn(
      'relative overflow-hidden bg-muted/50 rounded-lg',
      aspectRatioClasses[aspectRatio],
      className
    )}>
      {/* Loading state */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Laddar...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs text-center px-2">Kunde inte ladda bild</span>
          </div>
        </div>
      )}

      {/* Image */}
      <img
        src={currentSrc}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        className={cn(
          'w-full h-full object-cover transition-all duration-500',
          'group-hover:scale-105',
          isLoading && 'opacity-0',
          hasError && 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Shimmer effect while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      )}
    </div>
  );
};