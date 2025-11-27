import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  X,
  Image as ImageIcon,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';
import { useToast } from '@/hooks/use-toast';

interface AdminImageGalleryProps {
  images: string[];
  primaryImage?: string;
  onChange: (images: string[], primaryImage?: string) => void;
  maxImages?: number;
  showPrimarySelector?: boolean;
}

export function AdminImageGallery({
  images = [],
  primaryImage,
  onChange,
  maxImages = 8,
  showPrimarySelector = true
}: AdminImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const hasPrimaryImage = primaryImage && images.includes(primaryImage);
  const canUploadMore = images.length < maxImages;

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    if (files.length + images.length > maxImages) {
      toast({
        title: 'Too many files',
        description: `You can only upload up to ${maxImages} images. Current: ${images.length}, Adding: ${files.length}`,
        variant: 'destructive'
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload only image files (JPEG, PNG, GIF, WebP)',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast({
        title: 'File too large',
        description: 'Each image must be smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      // Create upload promises with progress tracking
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // In a full implementation, you'd upload to Supabase Storage here
        // For simplicity, we'll use the file as a blob URL
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              resolve(result);
            } else {
              reject(new Error(`Failed to read file ${file.name}`));
            }
          };
          reader.onerror = () => reject(new Error(`Error reading file ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      const newImages = [...images, ...uploadedUrls];

      // Set primary image if it's the first image
      const newPrimaryImage = !primaryImage && newImages.length > 0 ? newImages[0] : primaryImage;

      onChange(newImages, newPrimaryImage);
      setUploadStatus('success');

      toast({
        title: 'Images uploaded successfully',
        description: `${uploadedUrls.length} image(s) added to gallery`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: 'Upload failed',
        description: 'Some images could not be uploaded. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // Reset the input
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [images, primaryImage, maxImages, onChange, toast]);

  const handleRemoveImage = useCallback((imageToRemove: string) => {
    const newImages = images.filter(img => img !== imageToRemove);

    let newPrimaryImage: string | undefined = primaryImage;
    if (primaryImage === imageToRemove) {
      newPrimaryImage = newImages.length > 0 ? newImages[0] : undefined;
    }

    onChange(newImages, newPrimaryImage);

    toast({
      title: 'Image removed',
      description: 'Image has been removed from the gallery',
    });
  }, [images, primaryImage, onChange, toast]);

  const handleSetPrimary = useCallback((image: string) => {
    onChange(images, image);
    toast({
      title: 'Primary image set',
      description: 'This image will be used as the main product image',
    });
  }, [images, onChange, toast]);

  const handleUploadClick = () => {
    const input = document.getElementById('image-upload-admin') as HTMLInputElement;
    input?.click();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Product Images
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{images.length}/{maxImages} images</span>
              {hasPrimaryImage && (
                <Badge variant="default" className="bg-amber-500">
                  <Star className="h-3 w-3 mr-1" />
                  Primary set
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {uploadStatus === 'success' ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="h-12 w-12 text-red-500" />
                ) : uploading ? (
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {uploading ? 'Uploading images...' : 'Upload product images'}
                </h3>
                <p className="text-sm text-gray-500">
                  {canUploadMore
                    ? `Select images to upload. You can add up to ${maxImages - images.length} more images.`
                    : 'Maximum number of images reached.'}
                </p>
              </div>

              <input
                id="image-upload-admin"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading || !canUploadMore}
              />

              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={uploading || !canUploadMore}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Images
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
                <p>• Maximum file size: 5MB per image</p>
                <p>• Drag and drop coming soon</p>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          {images.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3">
                Uploaded Images {showPrimarySelector && '(Click star to set as primary)'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => {
                  const isPrimary = primaryImage === image;

                  return (
                    <div key={`${image}-${index}`} className="relative group">
                      <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        isPrimary ? 'border-amber-500' : 'border-gray-200'
                      }`}>
                        <img
                          src={image.startsWith('blob:') || image.startsWith('data:') || image.startsWith('http') ? image : getImageUrl(image)}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      {/* Status Indicators */}
                      {isPrimary && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1">
                          <Star className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-1">
                          {showPrimarySelector && !isPrimary && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSetPrimary(image)}
                              className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
                              title="Set as primary image"
                            >
                              <Star className="h-3 w-3 text-gray-600" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveImage(image)}
                            className="h-6 w-6 p-0 bg-white/90 hover:bg-red-50 shadow-sm hover:border-red-200"
                            title="Remove image"
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>

                      {/* Image Number */}
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Image Management Tips:</p>
                    <ul className="mt-1 ml-4 list-disc space-y-1">
                      <li>Hover over images to see action buttons</li>
                      <li>The primary image will be shown first on the auction page</li>
                      <li>You can remove images you don't want to include</li>
                      <li>Consider image quality - high resolution images work best</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
