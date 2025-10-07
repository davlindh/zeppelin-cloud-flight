
import React, { useState } from 'react';
import { getImageUrl, getImageAlt } from '@/utils/imageUtils';

interface AuctionImageGalleryProps {
  title: string;
  images?: string[];
  mainImage?: string;
}

export const AuctionImageGallery: React.FC<AuctionImageGalleryProps> = ({
  title,
  images = [],
  mainImage
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Use provided images or fallback to some default auction images
  const galleryImages = images.length > 0 ? images : [
    mainImage ?? "photo-1472396961693-142e6e269027",
    "photo-1509316975850-ff9c5deb0cd9",
    "photo-1513836279014-a89f7a76ae86"
  ];

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-lg overflow-hidden">
        <img 
          src={getImageUrl(galleryImages[selectedImage])} 
          alt={getImageAlt(title, 'auction')}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {galleryImages.slice(0, 3).map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
              selectedImage === index ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <img 
              src={getImageUrl(image)} 
              alt={`${title} - Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
