import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getThumbnailUrl, generateSrcSet } from '@/utils/thumbnailHelpers';
import { getImageUrl } from '@/utils/imageUtils';

interface OptimizedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  thumbnail?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  objectPosition?: string;
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  shadow?: boolean | 'sm' | 'md' | 'lg';
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'none';
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  sizes?: string;
  width?: number;
  height?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder.svg',
  priority = false,
  thumbnail = true,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  rounded = false,
  shadow = false,
  loading = 'lazy',
  placeholder = 'none',
  onLoad,
  onError,
  sizes,
  width,
  height
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Process image URL
  const processedSrc = getImageUrl(src);
  const finalFallback = getImageUrl(fallbackSrc);

  useEffect(() => {
    if (priority) {
      setCurrentSrc(processedSrc);
      return;
    }

    // Lazy loading with IntersectionObserver
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [priority, processedSrc]);

  useEffect(() => {
    if (isInView) {
      // Use thumbnail if enabled and image is from Supabase
      const imgSrc = thumbnail && processedSrc.includes('supabase.co/storage')
        ? getThumbnailUrl(processedSrc, { width: width || 800, quality: 85 })
        : processedSrc;
      
      setCurrentSrc(imgSrc);
    }
  }, [isInView, processedSrc, thumbnail, width]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && currentSrc !== finalFallback) {
      setCurrentSrc(finalFallback);
      setHasError(true);
      onError?.(e);
    }
    setIsLoading(false);
  };

  // Generate srcSet for responsive images
  const srcSet = isInView && processedSrc.includes('supabase.co/storage')
    ? generateSrcSet(processedSrc)
    : undefined;

  // Generate rounded classes
  const roundedClass = rounded === true ? 'rounded-lg' :
    rounded === 'sm' ? 'rounded-sm' :
    rounded === 'md' ? 'rounded-md' :
    rounded === 'lg' ? 'rounded-lg' :
    rounded === 'full' ? 'rounded-full' : '';

  // Generate shadow classes
  const shadowClass = shadow === true ? 'shadow-md' :
    shadow === 'sm' ? 'shadow-sm' :
    shadow === 'md' ? 'shadow-md' :
    shadow === 'lg' ? 'shadow-lg' : '';

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', roundedClass, shadowClass, className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Loading skeleton or blur placeholder */}
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0",
            placeholder === 'blur' 
              ? "bg-gradient-to-br from-muted/80 to-muted backdrop-blur-sm animate-pulse"
              : "bg-muted animate-pulse"
          )}
        />
      )}

      {/* Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          srcSet={srcSet}
          sizes={sizes}
          width={width}
          height={height}
          loading={priority ? 'eager' : loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none'
          )}
          style={{
            objectPosition,
            imageRendering: isLoading ? 'pixelated' : 'auto'
          }}
        />
      )}
    </div>
  );
};
