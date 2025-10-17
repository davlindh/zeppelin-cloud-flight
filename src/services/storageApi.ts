import { supabase } from "@/integrations/supabase/client";

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StorageFile {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, any> | null;
}

export interface StorageFileWithUrl extends StorageFile {
  publicUrl?: string;
  inDatabase: boolean;
  mediaId?: string;
  fullPath: string;
}

/**
 * List all storage buckets
 */
export async function listAllBuckets(): Promise<StorageBucket[]> {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Failed to list buckets:', error);
      // Return hardcoded list of known buckets as fallback
      return [
        { id: 'media-files', name: 'media-files', public: true },
        { id: 'project-images', name: 'project-images', public: true },
        { id: 'participant-avatars', name: 'participant-avatars', public: true },
        { id: 'sponsor-logos', name: 'sponsor-logos', public: true },
        { id: 'documents', name: 'documents', public: false },
        { id: 'ui', name: 'ui', public: true },
        { id: 'media', name: 'media', public: false },
        { id: 'product-images', name: 'product-images', public: true },
        { id: 'auction-images', name: 'auction-images', public: true },
        { id: 'service-images', name: 'service-images', public: true },
        { id: 'provider-avatars', name: 'provider-avatars', public: true },
      ];
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to list buckets:', error);
    // Return hardcoded list as fallback
    return [
      { id: 'media-files', name: 'media-files', public: true },
      { id: 'project-images', name: 'project-images', public: true },
      { id: 'participant-avatars', name: 'participant-avatars', public: true },
      { id: 'sponsor-logos', name: 'sponsor-logos', public: true },
      { id: 'documents', name: 'documents', public: false },
      { id: 'ui', name: 'ui', public: true },
      { id: 'media', name: 'media', public: false },
      { id: 'product-images', name: 'product-images', public: true },
      { id: 'auction-images', name: 'auction-images', public: true },
      { id: 'service-images', name: 'service-images', public: true },
      { id: 'provider-avatars', name: 'provider-avatars', public: true },
    ];
  }
}

/**
 * Recursively list all files in bucket including subdirectories
 */
async function listFilesRecursively(
  bucketName: string,
  path: string = '',
  allFiles: StorageFile[] = []
): Promise<StorageFile[]> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(path, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' }
    });
  
  if (error) {
    console.error(`Failed to list files in ${bucketName}/${path}:`, error);
    return allFiles;
  }
  
  if (!data) return allFiles;
  
  for (const item of data) {
    const fullPath = path ? `${path}/${item.name}` : item.name;
    
    if (item.id === null) {
      // This is a folder, recurse into it
      await listFilesRecursively(bucketName, fullPath, allFiles);
    } else {
      // This is a file
      allFiles.push({
        ...item,
        name: fullPath, // Use full path as name
      });
    }
  }
  
  return allFiles;
}

/**
 * List files in a specific bucket (with recursive folder scanning)
 */
export async function listFilesInBucket(
  bucketName: string,
  path: string = ''
): Promise<StorageFile[]> {
  try {
    return await listFilesRecursively(bucketName, path);
  } catch (error) {
    console.error(`Failed to list files in bucket ${bucketName}:`, error);
    return [];
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucketName: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Check if files exist in media_library database
 */
export async function checkFilesInDatabase(
  bucketName: string,
  files: StorageFile[]
): Promise<StorageFileWithUrl[]> {
  const filesWithStatus = await Promise.all(
    files.map(async (file) => {
      const storagePath = file.name;
      const publicUrl = getPublicUrl(bucketName, storagePath);
      
      // Check if this file exists in media_library
      const { data } = await supabase
        .from('media_library')
        .select('id')
        .eq('bucket', bucketName)
        .eq('storage_path', storagePath)
        .maybeSingle();
      
      return {
        ...file,
        fullPath: storagePath,
        publicUrl,
        inDatabase: !!data,
        mediaId: data?.id,
      };
    })
  );
  
  return filesWithStatus;
}

/**
 * Get file metadata from storage (including size and mime type)
 */
async function getFileMetadata(bucketName: string, filePath: string) {
  try {
    // Download file to get actual metadata
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);
    
    if (error) {
      console.error('Failed to get file metadata:', error);
      return { size: 0, mimeType: 'application/octet-stream' };
    }
    
    // Get actual file size and type
    const size = data.size;
    const mimeType = data.type || 'application/octet-stream';
    
    return { size, mimeType };
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    return { size: 0, mimeType: 'application/octet-stream' };
  }
}

/**
 * Import orphaned file to media_library
 */
export async function importFileToMediaLibrary(
  bucketName: string,
  file: StorageFileWithUrl,
  metadata: {
    title?: string;
    category?: string;
    tags?: string[];
    status?: string;
  }
) {
  // Get actual file metadata from storage
  const actualMetadata = await getFileMetadata(bucketName, file.fullPath);
  const mimeType = actualMetadata.mimeType;
  const fileSize = actualMetadata.size;
  
  // Determine media type
  let type: 'image' | 'video' | 'audio' | 'document' = 'document';
  if (mimeType.startsWith('image/')) type = 'image';
  else if (mimeType.startsWith('video/')) type = 'video';
  else if (mimeType.startsWith('audio/')) type = 'audio';
  
  // Generate smart title from filename (not full path)
  const filename = file.name.split('/').pop() || file.name;
  const title = metadata.title || filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
  
  // Generate thumbnail for images
  let thumbnailUrl: string | undefined;
  if (type === 'image' && file.publicUrl) {
    thumbnailUrl = `${file.publicUrl}?width=400&quality=75&format=webp`;
  }
  
  const { data, error } = await supabase
    .from('media_library')
    .insert({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      filename: filename,
      original_filename: filename,
      type,
      mime_type: mimeType,
      file_size: fileSize,
      storage_path: file.fullPath,
      public_url: file.publicUrl,
      thumbnail_url: thumbnailUrl,
      bucket: bucketName,
      source: 'imported',
      category: metadata.category,
      tags: metadata.tags || [],
      status: metadata.status || 'pending',
      is_public: true,
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

/**
 * Get storage statistics
 */
export async function getStorageStats(bucketName: string) {
  const files = await listFilesInBucket(bucketName);
  const filesWithStatus = await checkFilesInDatabase(bucketName, files);
  
  const totalFiles = files.length;
  const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
  const orphanedFiles = filesWithStatus.filter(f => !f.inDatabase).length;
  const linkedFiles = filesWithStatus.filter(f => f.inDatabase).length;
  
  return {
    totalFiles,
    totalSize,
    orphanedFiles,
    linkedFiles,
    files: filesWithStatus,
  };
}
