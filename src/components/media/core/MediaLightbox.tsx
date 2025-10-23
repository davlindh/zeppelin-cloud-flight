import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/media/Image';
import { ChevronLeft, ChevronRight, X, Play, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types/unified-media';

interface MediaLightboxProps {
  media: MediaItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  enableNavigation?: boolean;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  media,
  initialIndex,
  open,
  onClose,
  enableNavigation = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when opening with new initial index
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open || !enableNavigation) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case ' ': { // Space bar for play/pause
          const currentItem = media[currentIndex];
          if (currentItem?.type === 'video') {
            e.preventDefault();
            const video = document.querySelector('video') as HTMLVideoElement;
            if (video) {
              if (video.paused) {
                video.play();
              } else {
                video.pause();
              }
            }
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, enableNavigation, currentIndex, media, onClose]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!open || !media[currentIndex]) return null;

  const currentItem = media[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 bg-black/20 hover:bg-black/40 text-white border-0"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Navigation buttons */}
        {enableNavigation && media.length > 1 && (
          <>
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white border-0"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {currentIndex < media.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-12 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white border-0"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </>
        )}

        {/* Content */}
        <div className="relative">
          {currentItem.type === 'image' && (
            <div className="flex items-center justify-center p-4">
              <Image
                src={currentItem.url}
                alt={currentItem.title}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}

          {/* Video playback */}
          {currentItem.type === 'video' && (
            <div className="flex items-center justify-center p-4">
              <video
                src={currentItem.url}
                controls
                className="max-w-full max-h-[70vh] rounded-lg"
                poster={currentItem.thumbnail}
                preload="metadata"
                autoPlay={false}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Audio playback */}
          {currentItem.type === 'audio' && (
            <div className="flex items-center justify-center p-8 min-h-[50vh]">
              <div className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
                <div className="flex items-center justify-center">
                  <div className="p-6 rounded-full bg-green-500/20">
                    <Play className="h-16 w-16 text-green-500" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{currentItem.title}</h3>
                  {currentItem.description && (
                    <p className="text-muted-foreground">{currentItem.description}</p>
                  )}
                </div>
                <audio
                  src={currentItem.url}
                  controls
                  className="w-full"
                  preload="metadata"
                >
                  Your browser does not support the audio tag.
                </audio>
              </div>
            </div>
          )}

          {/* Document placeholder */}
          {currentItem.type === 'document' && (
            <div className="flex items-center justify-center p-8 min-h-[50vh]">
              <p className="text-muted-foreground">Document preview not available</p>
            </div>
          )}
        </div>

        {/* Footer with title and navigation info */}
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">
                {currentItem.title}
              </h3>
              {currentItem.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {currentItem.description}
                </p>
              )}
            </div>
            {enableNavigation && media.length > 1 && (
              <div className="text-sm text-muted-foreground ml-4">
                {currentIndex + 1} / {media.length}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
