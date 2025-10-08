
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn} from 'lucide-react';

interface ProductImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  onLightboxOpen?: () => void;
}

export const ProductImageZoom: React.FC<ProductImageZoomProps> = ({
  src,
  alt,
  className = '',
  onLightboxOpen
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden cursor-zoom-in group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onLightboxOpen}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          isHovered ? 'scale-150' : 'scale-100'
        }`}
        style={
          isHovered
            ? {
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
              }
            : {}
        }
      />
      
      {/* Zoom overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
      
      {/* Zoom icon */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
