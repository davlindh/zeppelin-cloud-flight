import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceImageGalleryProps {
  images: string[];
  title?: string;
}

export const ServiceImageGallery: React.FC<ServiceImageGalleryProps> = ({ images, title: _title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const handleNextClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No images available for this service.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Main Image with Controls */}
        <div className="relative group">
          <img
            src={images[currentImageIndex]}
            alt={`Service Image ${currentImageIndex + 1}`}
            className="w-full h-auto object-cover rounded-lg max-h-96"
          />
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevClick}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextClick}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next</span>
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {images.map((image, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden transition-all",
                  "hover:ring-2 hover:ring-primary/50 hover:scale-105",
                  idx === currentImageIndex 
                    ? "ring-2 ring-primary shadow-md" 
                    : "ring-1 ring-border opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
