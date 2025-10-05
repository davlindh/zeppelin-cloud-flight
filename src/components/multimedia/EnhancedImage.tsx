import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Enhanced Image Component with Context7 Best Practices
// Features: Lazy loading, error handling, progressive enhancement, accessibility, performance optimization

interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty' | React.ReactNode;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  transition?: boolean;
  hover?: boolean;
  zoom?: boolean;
  overlay?: boolean;
  caption?: string;
  credit?: string;
  aspectRatio?: string;
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  shadow?: boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  grayscale?: boolean;
  blur?: boolean;
  brightness?: number;
  contrast?: number;
  saturate?: number;
  hueRotate?: number;
  invert?: boolean;
  sepia?: boolean;
  dropShadow?: boolean;
}

const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  sizes,
  loading = 'lazy',
  decoding = 'async',
  objectFit = 'cover',
  objectPosition = 'center',
  transition = true,
  hover = false,
  zoom = false,
  overlay = false,
  caption,
  credit,
  aspectRatio,
  rounded = false,
  shadow = false,
  border = false,
  grayscale = false,
  blur: blurEffect = false,
  brightness = 100,
  contrast = 100,
  saturate = 100,
  hueRotate = 0,
  invert = false,
  sepia = false,
  dropShadow = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback((error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(error);
  }, [onError]);

  // Generate filter styles
  const filterStyles = useMemo(() => {
    const filters: string[] = [];

    if (grayscale) filters.push('grayscale(100%)');
    if (blurEffect) filters.push('blur(2px)');
    if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
    if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
    if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
    if (hueRotate !== 0) filters.push(`hue-rotate(${hueRotate}deg)`);
    if (invert) filters.push('invert(100%)');
    if (sepia) filters.push('sepia(100%)');

    return filters.length > 0 ? filters.join(' ') : undefined;
  }, [grayscale, blurEffect, brightness, contrast, saturate, hueRotate, invert, sepia]);

  // Generate container classes
  const containerClasses = cn(
    'relative overflow-hidden',
    {
      'rounded-sm': rounded === 'sm',
      'rounded-md': rounded === 'md' || rounded === true,
      'rounded-lg': rounded === 'lg',
      'rounded-xl': rounded === 'xl',
      'rounded-2xl': rounded === '2xl',
      'rounded-3xl': rounded === '3xl',
      'rounded-full': rounded === 'full',
      'shadow-sm': shadow === 'sm',
      'shadow-md': shadow === 'md' || shadow === true,
      'shadow-lg': shadow === 'lg',
      'shadow-xl': shadow === 'xl',
      'shadow-2xl': shadow === '2xl',
      'border border-border': border,
      'aspect-square': aspectRatio === 'square',
      'aspect-video': aspectRatio === 'video',
      'aspect-[4/3]': aspectRatio === '4/3',
      'aspect-[16/9]': aspectRatio === '16/9',
      'aspect-[3/4]': aspectRatio === '3/4',
      'aspect-[9/16]': aspectRatio === '9/16',
      'group cursor-pointer': hover || zoom,
      'transition-all duration-300 ease-in-out': transition,
      'hover:scale-105': zoom,
      'hover:shadow-lg hover:shadow-primary/20': hover,
    },
    className
  );

  // Generate image classes
  const imageClasses = cn(
    'w-full h-full object-cover transition-all duration-300',
    {
      'object-contain': objectFit === 'contain',
      'object-cover': objectFit === 'cover',
      'object-fill': objectFit === 'fill',
      'object-none': objectFit === 'none',
      'object-scale-down': objectFit === 'scale-down',
      'opacity-0': !isLoaded,
      'opacity-100': isLoaded,
      'group-hover:scale-110': zoom,
      'group-hover:brightness-110': hover,
    }
  );

  // Placeholder component
  const Placeholder = () => {
    if (placeholder === 'empty') {
      return (
        <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (placeholder === 'blur' && blurDataURL) {
      return (
        <img
          src={blurDataURL}
          alt=""
          className={cn(imageClasses, 'blur-sm scale-110')}
          style={{ filter: 'blur(10px)' }}
        />
      );
    }

    if (React.isValidElement(placeholder)) {
      return placeholder;
    }

    return null;
  };

  // Error fallback
  const ErrorFallback = () => (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-sm">Failed to load image</p>
      </div>
    </div>
  );

  // Generate srcSet for responsive images
  const generateSrcSet = useMemo(() => {
    if (!src) return undefined;
    
    // For Supabase storage URLs, generate responsive sizes
    if (src.includes('supabase') && (width || height)) {
      const sizes = [640, 750, 828, 1080, 1200, 1920];
      return sizes
        .filter(size => !width || size <= width)
        .map(size => `${src}?width=${size} ${size}w`)
        .join(', ');
    }
    
    return undefined;
  }, [src, width, height]);

  return (
    <figure className={containerClasses} ref={containerRef}>
      {/* Main Image */}
      <div className="relative w-full h-full">
        {isInView && !hasError && (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            srcSet={generateSrcSet}
            loading={loading}
            decoding={decoding}
            onLoad={handleLoad}
            onError={handleError}
            className={imageClasses}
            style={{
              objectPosition,
              filter: filterStyles,
              ...(dropShadow && { filter: `${filterStyles || ''} drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))` }),
            }}
          />
        )}

        {/* Placeholder */}
        {(!isLoaded || hasError) && !isInView && <Placeholder />}

        {/* Error State */}
        {hasError && <ErrorFallback />}

        {/* Overlay */}
        {overlay && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </div>

      {/* Caption */}
      {(caption || credit) && (
        <figcaption className="mt-2 text-sm text-muted-foreground">
          {caption && <span>{caption}</span>}
          {caption && credit && <span className="mx-2">•</span>}
          {credit && <span className="text-xs">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
};

export { EnhancedImage };
export type { EnhancedImageProps };
