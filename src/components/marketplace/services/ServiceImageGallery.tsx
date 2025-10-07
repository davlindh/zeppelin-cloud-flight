import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    return <Card>
      <CardContent>No images available for this service.</CardContent>
    </Card>;
  }

  return (
    <Card>
      <CardContent className="relative">
        <img
          src={images[currentImageIndex]}
          alt={`Service Image ${currentImageIndex + 1}`}
          className="w-full h-auto object-cover rounded-md max-h-96"
        />
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevClick}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800"
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800"
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next</span>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
