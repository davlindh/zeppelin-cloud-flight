import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Trash2, Eye, Star, Camera } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface EnhancedImageManagementProps {
  images: string[];
  onChange: (images: string[], primaryImage?: string) => void;
  maxImages?: number;
  entityType: 'product' | 'auction' | 'service';
}

export const EnhancedImageManagement: React.FC<EnhancedImageManagementProps> = ({
  images,
  onChange,
  maxImages = 10,
  entityType
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  
  // Use the base image upload hook
  const { uploadMultiple, deleteFromSupabase, uploadProgress } = useImageUpload();
  
  const getFolderByType = (type: string) => {
    switch (type) {
      case 'product': return 'products';
      case 'auction': return 'auctions';
      case 'service': return 'services';
      default: return 'admin';
    }
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      alert(`Can only upload ${remainingSlots} more images (maximum ${maxImages} total)`);
      return;
    }

    try {
      const results = await uploadMultiple(fileArray, 'uploads', getFolderByType(entityType));
      const newImageUrls = results.map(result => result.url);
      const updatedImages = [...images, ...newImageUrls];
      onChange(updatedImages, updatedImages[primaryImageIndex]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [images, maxImages, uploadMultiple, onChange, primaryImageIndex]);

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Extract path from URL for Supabase storage
      if (imageUrl) {
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const storagePath = pathParts.slice(-2).join('/'); // Get folder/filename
        if (storagePath) {
          await deleteFromSupabase(storagePath, 'uploads');
        }
      }
    } catch (error) {
      console.error('Failed to delete from storage:', error);
    }

    const updatedImages = images.filter((_, i) => i !== index);
    const newPrimaryIndex = primaryImageIndex >= index ? Math.max(0, primaryImageIndex - 1) : primaryImageIndex;
    setPrimaryImageIndex(Math.min(newPrimaryIndex, updatedImages.length - 1));
    onChange(updatedImages, updatedImages[newPrimaryIndex]);
  }, [images, primaryImageIndex, onChange, deleteFromSupabase]);

  const handleSetPrimary = useCallback((index: number) => {
    setPrimaryImageIndex(index);
    onChange(images, images[index]);
  }, [images, onChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Image Management
          <Badge variant="secondary">
            {images.length} image{images.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadProgress.isUploading || images.length >= maxImages}
          />
          
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
            <p className="text-lg font-medium">
              {uploadProgress.isUploading ? 'Uploading...' : 'Drop images here or click to browse'}
            </p>
              <p className="text-sm text-gray-500">
                {images.length} / {maxImages} images uploaded
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress.isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Uploading images...</span>
              <span className="text-sm text-gray-500">{Math.round(uploadProgress.progress)}%</span>
            </div>
            <Progress value={uploadProgress.progress} className="w-full" />
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Uploaded Images</h3>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Primary image</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    index === primaryImageIndex ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200'
                  }`}>
                    <img
                      src={image}
                      alt={`${entityType} image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Primary Badge */}
                    {index === primaryImageIndex && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      </div>
                    )}
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {index !== primaryImageIndex && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(index)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-center mt-1 text-gray-500">
                    Image {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>• Supported formats: JPEG, PNG, WebP</p>
          <p>• Maximum file size: 10MB per image</p>
          <p>• The first image will be used as the primary image</p>
          <p>• Click the star icon to set a different primary image</p>
        </div>
      </CardContent>
    </Card>
  );
};