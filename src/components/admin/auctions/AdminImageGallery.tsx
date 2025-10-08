import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Star, 
  StarOff, 
  Move, 
  Camera,
  Image as ImageIcon 
} from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Remove unused interface

interface AuctionImageGalleryProps {
  images: string[];
  primaryImage?: string;
  onChange: (images: string[], primaryImage?: string) => void;
  maxImages?: number;
}

export const AdminImageGallery: React.FC<AuctionImageGalleryProps> = ({
  images = [],
  primaryImage,
  onChange,
  maxImages = 8
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { handleFileSelect, uploadMultiple, captureImage } = useImageUpload();
  const { toast } = useToast();

  // Organize images with primary first
  const organizedImages = React.useMemo(() => {
    const imageList = [...images];
    if (primaryImage && !imageList.includes(primaryImage)) {
      imageList.unshift(primaryImage);
    }
    return imageList.map((url, index) => ({
      url,
      isPrimary: url === primaryImage || (index === 0 && !primaryImage),
      order: index
    }));
  }, [images, primaryImage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + images.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const results = await uploadMultiple(files, 'uploads', 'auctions');
      const newImageUrls = results.map(result => result.url);
      const updatedImages = [...images, ...newImageUrls];
      
      onChange(updatedImages, primaryImage || updatedImages[0]);
      
      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${results.length} image(s).`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCameraCapture = async () => {
    try {
      const imageFile = await captureImage();
      if (imageFile) {
        const fakeEvent = {
          target: { files: [imageFile] }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        
        const result = await handleFileSelect(fakeEvent, 'uploads', 'auctions');
        
        if (result) {
          const updatedImages = [...images, result.url];
          onChange(updatedImages, primaryImage || result.url);
          
          toast({
            title: "Image captured",
            description: "Successfully captured and uploaded image.",
          });
        }
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      toast({
        title: "Camera failed",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    const imageToRemove = organizedImages[indexToRemove]?.url;
    if (!imageToRemove) return;
    
    const updatedImages = images.filter(url => url !== imageToRemove);
    const newPrimaryImage = imageToRemove === primaryImage 
      ? updatedImages[0] 
      : primaryImage;
    
    onChange(updatedImages, newPrimaryImage);
  };

  const setPrimaryImage = (imageUrl: string) => {
    onChange(images, imageUrl);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const reorderedImages = [...images];
      const [draggedImage] = reorderedImages.splice(draggedIndex, 1);
      
      if (draggedImage) {
        reorderedImages.splice(dragOverIndex, 0, draggedImage);
        
        const newPrimary = primaryImage && reorderedImages.includes(primaryImage) 
          ? primaryImage 
          : reorderedImages[0];
        if (newPrimary) {
          onChange(reorderedImages, newPrimary);
        } else {
          onChange(reorderedImages);
        }
      }
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
          disabled={images.length >= maxImages}
        >
          <Upload className="h-4 w-4" />
          Upload Images
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleCameraCapture}
          className="flex items-center gap-2"
          disabled={images.length >= maxImages}
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
        
        <div className="text-sm text-muted-foreground self-center">
          {images.length}/{maxImages} images
        </div>
      </div>

      {/* Image Gallery */}
      {organizedImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {organizedImages.map((imageItem, index) => (
            <Card
              key={imageItem.url}
              className={cn(
                "relative group cursor-move overflow-hidden",
                dragOverIndex === index && "ring-2 ring-primary",
                imageItem.isPrimary && "ring-2 ring-yellow-500"
              )}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="aspect-square">
                <img
                  src={imageItem.url}
                  alt={`Auction image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Primary Badge */}
              {imageItem.isPrimary && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2 bg-yellow-500 text-white"
                >
                  Primary
                </Badge>
              )}
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setPrimaryImage(imageItem.url)}
                  disabled={imageItem.isPrimary}
                  className="h-8 w-8 p-0"
                  title={imageItem.isPrimary ? "Primary image" : "Set as primary"}
                >
                  {imageItem.isPrimary ? (
                    <Star className="h-3 w-3 fill-current" />
                  ) : (
                    <StarOff className="h-3 w-3" />
                  )}
                </Button>
                
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                  className="h-8 w-8 p-0"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Drag Handle */}
              <div className="absolute top-2 right-2 text-white/80">
                <Move className="h-4 w-4" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-muted-foreground/25 p-8">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No images uploaded yet</p>
            <p className="text-sm text-muted-foreground">
              Upload or capture images for your auction listing
            </p>
          </div>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};