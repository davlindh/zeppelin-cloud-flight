import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { replaceImage, deleteImageSafely, getImageMetadata } from '@/utils/marketplace/imageManager';

interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error?: string;
}

interface ImageUploadResult {
  url: string;
  path: string;
  file: File;
}

export const useImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false,
  });
  const { toast } = useToast();

  // Camera capture function
  const captureImage = useCallback(async (): Promise<File | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      });

      return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Capture frame after a brief delay
          setTimeout(() => {
            if (context) {
              context.drawImage(video, 0, 0);
              canvas.toBlob((blob) => {
                stream.getTracks().forEach(track => track.stop());
                if (blob) {
                  const file = new File([blob], `capture-${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                  });
                  resolve(file);
                } else {
                  resolve(null);
                }
              }, 'image/jpeg', 0.8);
            } else {
              resolve(null);
            }
          }, 1000);
        };
      });
    } catch (error) {
      console.error('Camera capture error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please try selecting an image file instead.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // File compression and optimization
  const optimizeImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate optimal dimensions (max 1200px width/height)
        const maxSize = 1200;
        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        if (context) {
          context.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.8
          );
        } else {
          resolve(file);
        }
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Upload to Supabase Storage
  const uploadToSupabase = useCallback(async (
    file: File,
    bucket: string = 'uploads',
    folder: string = 'admin'
  ): Promise<ImageUploadResult | null> => {
    try {
      setUploadProgress({ progress: 0, isUploading: true });

      // Optimize image first
      const optimizedFile = await optimizeImage(file);
      
      // Generate unique filename
      const fileExt = optimizedFile.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      setUploadProgress({ progress: 25, isUploading: true });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, optimizedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      setUploadProgress({ progress: 75, isUploading: true });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadProgress({ progress: 100, isUploading: false });

      return {
        url: urlData.publicUrl,
        path: data.path,
        file: optimizedFile,
      };
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({ 
        progress: 0, 
        isUploading: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
      
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [optimizeImage, toast]);

  // Delete from Supabase Storage
  const deleteFromSupabase = useCallback(async (
    path: string,
    bucket: string = 'uploads'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete image.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Handle file input change
  const handleFileSelect = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    bucket?: string,
    folder?: string
  ): Promise<ImageUploadResult | null> => {
    const file = event.target.files?.[0];
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return null;
    }

    return uploadToSupabase(file, bucket, folder);
  }, [uploadToSupabase, toast]);

  // Batch upload multiple images
  const uploadMultiple = useCallback(async (
    files: File[],
    bucket?: string,
    folder?: string
  ): Promise<ImageUploadResult[]> => {
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ 
        progress: (i / files.length) * 100, 
        isUploading: true 
      });
      
      if (file) {
        const result = await uploadToSupabase(file, bucket, folder);
        if (result) {
          results.push(result);
        }
      }
    }
    
    setUploadProgress({ progress: 100, isUploading: false });
    return results;
  }, [uploadToSupabase]);

  // Enhanced replace function with automatic cleanup
  const replaceImageWithCleanup = useCallback(async (
    newFile: File,
    oldImageUrl?: string | null,
    bucket: string = 'uploads',
    folder: string = 'admin'
  ): Promise<ImageUploadResult | null> => {
    try {
      setUploadProgress({ progress: 0, isUploading: true });

      // Optimize image first
      const optimizedFile = await optimizeImage(newFile);
      
      const result = await replaceImage(optimizedFile, {
        oldImageUrl,
        bucket,
        folder,
      });

      setUploadProgress({ progress: 100, isUploading: false });

      if (result) {
        return {
          url: result.url,
          path: result.path,
          file: optimizedFile,
        };
      }

      return null;
    } catch (error) {
      console.error('Replace image error:', error);
      setUploadProgress({ 
        progress: 0, 
        isUploading: false, 
        error: error instanceof Error ? error.message : 'Replace failed' 
      });
      
      toast({
        title: "Replace Failed",
        description: "Failed to replace image. Please try again.",
        variant: "destructive",
      });
      
      return null;
    }
  }, [optimizeImage, toast]);

  return {
    uploadProgress,
    captureImage,
    uploadToSupabase,
    deleteFromSupabase,
    handleFileSelect,
    uploadMultiple,
    optimizeImage,
    replaceImageWithCleanup,
    getImageMetadata,
    deleteImageSafely,
  };
};
