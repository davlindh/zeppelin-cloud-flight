import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { Button } from '@/components/ui/button';

interface ProductImageSwiperProps {
  images: string[];
  alt: string;
  onLightboxOpen?: (index: number) => void;
  className?: string;
}

export const ProductImageSwiper: React.FC<ProductImageSwiperProps> = ({
  images,
  alt,
  onLightboxOpen,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Swipe gestures
  const { elementRef } = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 50
  });

  if (images.length === 0) {
    return (
      <div className={cn("aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center", className)}>
        <p className="text-muted-foreground text-sm">No images available</p>
      </div>
    );
  }

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={cn("relative aspect-square rounded-2xl overflow-hidden group", className)}
    >
      {/* Main Image */}
      <div
        className="w-full h-full cursor-pointer"
        onClick={() => onLightboxOpen?.(currentIndex)}
      >
        <img
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-300"
        />
      </div>

      {/* Navigation Buttons - Desktop */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white",
              "shadow-lg backdrop-blur-sm z-10 touch-target",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "hidden md:flex"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white",
              "shadow-lg backdrop-blur-sm z-10 touch-target",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "hidden md:flex"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200 touch-target",
                index === currentIndex 
                  ? "bg-white w-6" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe Hint for Mobile */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 md:hidden">
          <div className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            Swipe to view more
          </div>
        </div>
      )}
    </div>
  );
};
