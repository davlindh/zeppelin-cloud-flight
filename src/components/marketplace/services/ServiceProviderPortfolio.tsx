import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceProviderPortfolioProps {
  images: string[];
}

export const ServiceProviderPortfolio: React.FC<ServiceProviderPortfolioProps> = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={`Portfolio item ${currentImageIndex + 1}`}
              className="w-full h-64 object-cover rounded-md"
            />
            <div className="absolute top-1/2 left-2 -translate-y-1/2">
              <Button variant="ghost" size="icon" onClick={handlePrev}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-center text-slate-500">No portfolio images available.</p>
        )}
      </CardContent>
    </Card>
  );
};

