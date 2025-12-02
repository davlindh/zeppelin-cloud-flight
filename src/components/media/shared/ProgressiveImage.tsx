import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo
} from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  /** Full resolution image source */
  src: string;
  /** Thumbnail/blur placeholder source */
  thumbnail?: string;
  /** Alt text for accessibility */
  alt: string;
  /** CSS classes */
  className?: string;
  /** Container aspect ratio */
  aspectRatio?: 'square' | 'video' | 'portrait' | number;
  /** Click handler */
  onClick?: () => void;
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  /** Quality settings */
  quality?: 'low' | 'medium' | 'high';
  /** Enable blur effect */
  enableBlur?: boolean;
  /** Custom blur intensity */
  blurIntensity?: number;
  /** Transition duration */
  transitionDuration?: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = memo(({
  src,
  thumbnail,
  alt,
  className,
  aspectRatio = 'square',
  onClick,
  loading = 'lazy',
  quality = 'high',
  enableBlur = true,
  blurIntensity = 20,
  transitionDuration = 300
}) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLImageElement>(null);

  // Calculate aspect ratio styles
  const aspectRatioStyles = React.useMemo(() => {
    const ratios = {
      square: 'aspect-square',
      video: 'aspect-video',
      portrait: 'aspect-[3/4]'
    };

    if (typeof aspectRatio === 'number') {
      return { paddingBottom: `${(1 / aspectRatio) * 100}%` };
    }

    return ratios[aspectRatio] || 'aspect-square';
  }, [aspectRatio]);

  // Preload main image
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = getOptimizedUrl(src, quality);

    img.onload = () => {
      setImageLoaded(true);
      // Start transition after a small delay to ensure rendering
      setTimeout(() => setShowPlaceholder(false), 50);
    };

    img.onerror = () => {
      setLoadState('error');
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, quality]);

  // Handle image click
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Handle image error
  const handleError = useCallback(() => {
    setLoadState('error');
    setImageLoaded(false);
  }, []);

  // Optimize image URL (could integrate with CDN)
  const getOptimizedUrl = useCallback((url: string, quality: string) => {
    // Placeholder for CDN optimization parameters
    const params = {
      low: 'q=60&w=400',
      medium: 'q=80&w=800',
      high: 'q=90&w=1200'
    };
    return `${url}?${params[quality]}`;
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted cursor-pointer group",
        typeof aspectRatio === 'string' ? aspectRatioStyles : '',
        className
      )}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
      style={typeof aspectRatio === 'number' ? { position: 'relative' } : undefined}
      aria-label={alt}
    >
      {/* Placeholder/Blur Image */}
      {(enableBlur && thumbnail && showPlaceholder) && (
        <img
          ref={placeholderRef}
          src={thumbnail}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            enableBlur && "blur-sm scale-105",
            imageLoaded ? "opacity-0" : "opacity-100"
          )}
          style={{
            filter: enableBlur ? `blur(${blurIntensity}px)` : undefined
          }}
          loading="eager"
          aria-hidden="true"
        />
      )}

      {/* Loading Placeholder */}
      {!imageLoaded && !thumbnail && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Main Image */}
      <img
        ref={imageRef}
        src={getOptimizedUrl(src, quality)}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          "group-hover:scale-105",
          imageLoaded ? "opacity-100" : "opacity-0",
        )}
        loading={loading}
        onLoad={() => setLoadState('loaded')}
        onError={handleError}
        style={{
          transitionDuration: `${transitionDuration}ms`,
        }}
      />

      {/* Error State */}
      {loadState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm text-center px-2">
            Failed to load image
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      {onClick && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';
