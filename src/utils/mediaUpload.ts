import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-extensions';
import { UNIFIED_STORAGE } from '../../constants/storage';
import type { MediaLibraryItem, MediaUploadOptions } from '@/types/mediaLibrary';

// Create typed Supabase client with extended types
const supabaseUrl = 'https://paywaomkmjssbtkzwnwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXdhb21rbWpzc2J0a3p3bndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDg0NDIsImV4cCI6MjA3MzAyNDQ0Mn0.NkWnQCMJA3bZQy5746C_SmlWsT3pLnNOOLUNjlPv0tI';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Extract file metadata (dimensions for images, duration for video/audio)
 */
export const extractFileMetadata = (file: File): Promise<{
  width?: number;
  height?: number;
  duration?: number;
}> => {
  return new Promise((resolve) => {
    const type = file.type.split('/')[0];

    if (type === 'image') {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    } else if (type === 'video') {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: Math.floor(video.duration),
        });
      };
      video.onerror = () => resolve({});
      video.src = URL.createObjectURL(file);
    } else if (type === 'audio') {
      const audio = document.createElement('audio');
      audio.onloadedmetadata = () => {
        resolve({
          duration: Math.floor(audio.duration),
        });
      };
      audio.onerror = () => resolve({});
      audio.src = URL.createObjectURL(file);
    } else {
      resolve({});
    }
  });
};

/**
 * Get media type from MIME type
 * @param mimeType - MIME type string
 * @returns Media type category
 */
function getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

/**
 * Generate smart title from filename
 * @param filename - Original filename
 * @returns Cleaned, user-friendly title
 */
function generateSmartTitle(filename: string): string {
  // Remove extension
  let title = filename.replace(/\.[^.]+$/, '');
  
  // Remove timestamp and hash patterns (e.g., "1759747290724-ysfzo5yhp4")
  title = title.replace(/[0-9]{13,}-[a-z0-9]+/g, '');
  
  // Replace underscores and hyphens with spaces
  title = title.replace(/[_-]/g, ' ');
  
  // Trim and capitalize
  title = title.trim();
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return title || 'Untitled Media';
}

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (file: File): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const extension = file.name.split('.').pop();
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .substring(0, 50);
  
  return `${safeName}-${timestamp}-${random}.${extension}`;
};

/**
 * Validate file type and size
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const bucket = 'media-files';
  const bucketConfig = UNIFIED_STORAGE[bucket];

  // Check file size
  if (file.size > bucketConfig.maxSize) {
    const maxSizeMB = Math.floor(bucketConfig.maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  const isValidType = (bucketConfig.allowedTypes as readonly string[]).some(
    (allowedType) => {
      if (allowedType.endsWith('/*')) {
        const baseType = allowedType.replace('/*', '');
        return file.type.startsWith(baseType);
      }
      return file.type === allowedType;
    }
  );

  if (!isValidType) {
    return {
      valid: false,
      error: 'File type not allowed',
    };
  }

  return { valid: true };
};

/**
 * Upload file to media library
 * Single source of truth for all media uploads
 */
export const uploadToMediaLibrary = async (
  file: File,
  options: MediaUploadOptions = {}
): Promise<MediaLibraryItem> => {
  // 1. Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 2. Generate unique filename
  const filename = generateUniqueFilename(file);
  const folder = options.folder || 'general';
  const storagePath = `${folder}/${filename}`;

  // 3. Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media-files')
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // 4. Get public URL
  const { data: urlData } = supabase.storage
    .from('media-files')
    .getPublicUrl(uploadData.path);

  // 5. Extract file metadata
  const fileMetadata = await extractFileMetadata(file);
  const mediaType = getMediaType(file.type);

  // 6. Generate thumbnail URL for images using Supabase transform
  let thumbnailUrl: string | undefined;
  if (mediaType === 'image') {
    thumbnailUrl = `${urlData.publicUrl}?width=400&quality=75&format=webp`;
  }

  // 7. Generate smart title from filename
  const smartTitle = options.metadata?.title || generateSmartTitle(file.name);

  // 8. Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // 9. Create media_library record
  const { data: mediaRecord, error: dbError } = await supabase
    .from('media_library')
    .insert({
      title: smartTitle,
      description: options.metadata?.description,
      filename: filename,
      original_filename: file.name,
      type: mediaType,
      mime_type: file.type,
      bucket: 'media-files',
      storage_path: uploadData.path,
      public_url: urlData.publicUrl,
      thumbnail_url: thumbnailUrl,
      file_size: file.size,
      width: fileMetadata.width,
      height: fileMetadata.height,
      duration: fileMetadata.duration,
      status: options.autoApprove ? 'approved' : 'pending',
      source: options.submissionId ? 'submission' : 'admin-upload',
      uploaded_by: user?.id,
      project_id: options.projectId,
      participant_id: options.participantId,
      submission_id: options.submissionId,
      tags: options.metadata?.tags || [],
      category: options.metadata?.category,
      is_public: options.metadata?.is_public ?? true,
      is_featured: options.metadata?.is_featured ?? false,
    } as any)
    .select()
    .single();

  if (dbError) {
    // Cleanup: delete uploaded file if database insert fails
    await supabase.storage.from('media-files').remove([uploadData.path]);
    throw new Error(`Database insert failed: ${dbError.message}`);
  }

  return mediaRecord as MediaLibraryItem;
};

/**
 * Upload multiple files to media library
 */
export const uploadMultipleToMediaLibrary = async (
  files: File[],
  options: MediaUploadOptions = {}
): Promise<{ success: MediaLibraryItem[]; failed: { file: File; error: string }[] }> => {
  const results = await Promise.allSettled(
    files.map((file) => uploadToMediaLibrary(file, options))
  );

  const success: MediaLibraryItem[] = [];
  const failed: { file: File; error: string }[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      success.push(result.value);
    } else {
      failed.push({
        file: files[index],
        error: result.reason.message || 'Unknown error',
      });
    }
  });

  return { success, failed };
};
