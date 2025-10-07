// Unified image management utilities with consistent cleanup and handling

import { supabase } from '@/integrations/supabase/client';
import { getImageUrl, getStoragePathFromPublicUrl } from './imageUtils';

export interface ImageReplaceOptions {
  oldImageUrl?: string | null;
  bucket?: string;
  folder?: string;
}

export interface ImageDeleteOptions {
  bucket?: string;
}

/**
 * Safely replace an image with automatic cleanup of the old image
 */
export const replaceImage = async (
  newFile: File,
  options: ImageReplaceOptions = {}
): Promise<{ url: string; path: string } | null> => {
  const { oldImageUrl, bucket = 'uploads', folder = 'admin' } = options;

  try {
    // First, upload the new image
    const fileExt = newFile.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, newFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL for new image
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    const newImageUrl = urlData.publicUrl;

    // If there was an old image, clean it up
    if (oldImageUrl && oldImageUrl !== '/placeholder.svg') {
      await deleteImageSafely(oldImageUrl, { bucket });
    }

    return {
      url: newImageUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Image replace error:', error);
    return null;
  }
};

/**
 * Safely delete an image from storage with proper path extraction
 */
export const deleteImageSafely = async (
  imageUrl: string,
  options: ImageDeleteOptions = {}
): Promise<boolean> => {
  const { bucket = 'uploads' } = options;

  try {
    // Skip deletion for placeholder images
    if (!imageUrl || imageUrl === '/placeholder.svg' || imageUrl === ') {
      return true;
    }

    // Extract storage path from public URL
    const storagePath = getStoragePathFromPublicUrl(imageUrl);
    if (!storagePath) {
      console.warn('Could not extract storage path from URL:', imageUrl);
      return false;
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([storagePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Image delete error:', error);
    return false;
  }
};

/**
 * Clean up multiple images from storage
 */
export const deleteMultipleImages = async (
  imageUrls: (string | null)[],
  options: ImageDeleteOptions = {}
): Promise<{ success: number; failed: number }> => {
  const validUrls = imageUrls.filter(url => 
    url && url !== '/placeholder.svg' && url !== '
  ) as string[];

  let success = 0;
  let failed = 0;

  for (const url of validUrls) {
    const deleted = await deleteImageSafely(url, options);
    if (deleted) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
};

/**
 * Ensure image URL uses the correct format for the uploads bucket
 */
export const normalizeImageUrl = (imageUrl?: string | null): string => {
  return getImageUrl(imageUrl);
};

/**
 * Get optimized image URL with size parameters (for future CDN integration)
 */
export const getOptimizedImageUrl = (imageUrl: string): string => {
  // For now, return the normalized URL
  // In the future, this could add transformation parameters for a CDN
  return normalizeImageUrl(imageUrl);
};

/**
 * Validate if an image URL is from our uploads bucket
 */
export const isUploadsBucketImage = (imageUrl: string): boolean => {
  if (!imageUrl || imageUrl === '/placeholder.svg') return false;
  
  return imageUrl.includes('supabase.co/storage/v1/object/public/uploads/') ||
         imageUrl.startsWith('/storage/v1/object/public/uploads/');
};

/**
 * Extract metadata from an image file
 */
export const getImageMetadata = (file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        type: file.type,
        name: file.name,
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};