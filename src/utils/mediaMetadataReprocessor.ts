import { supabase } from "@/integrations/supabase/client";

interface ReprocessResult {
  success: boolean;
  mediaId: string;
  updates?: {
    file_size?: number;
    width?: number;
    height?: number;
    duration?: number;
    thumbnail_url?: string;
    title?: string;
  };
  error?: string;
}

/**
 * Fetch file size from storage URL
 */
async function fetchFileSize(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : null;
  } catch (error) {
    console.error('Failed to fetch file size:', error);
    return null;
  }
}

/**
 * Extract image dimensions from URL
 */
async function extractImageDimensions(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Clean and improve title
 */
function cleanTitle(filename: string): string {
  // Remove extension
  let title = filename.replace(/\.[^.]+$/, '');
  
  // Remove timestamp and hash patterns
  title = title.replace(/[0-9]{13,}-[a-z0-9]+/g, '');
  
  // Replace underscores and hyphens with spaces
  title = title.replace(/[_-]/g, ' ');
  
  // Trim and capitalize
  title = title.trim();
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return title || 'Untitled Media';
}

/**
 * Reprocess metadata for a single media item
 */
export async function reprocessMediaMetadata(mediaId: string): Promise<ReprocessResult> {
  try {
    // Fetch media item from database
    const { data: media, error: fetchError } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (fetchError || !media) {
      return {
        success: false,
        mediaId,
        error: fetchError?.message || 'Media not found',
      };
    }

    const updates: ReprocessResult['updates'] = {};

    // Fix file size if missing
    if (!media.file_size && media.public_url) {
      const fileSize = await fetchFileSize(media.public_url);
      if (fileSize) {
        updates.file_size = fileSize;
      }
    }

    // Fix dimensions for images
    if (media.type === 'image' && (!media.width || !media.height) && media.public_url) {
      const dimensions = await extractImageDimensions(media.public_url);
      if (dimensions) {
        updates.width = dimensions.width;
        updates.height = dimensions.height;
      }
    }

    // Generate thumbnail URL for images if missing
    if (media.type === 'image' && !media.thumbnail_url && media.public_url) {
      updates.thumbnail_url = `${media.public_url}?width=400&quality=75&format=webp`;
    }

    // Fix generic title
    if (media.title?.match(/^file_[0-9]+$/) && media.original_filename) {
      updates.title = cleanTitle(media.original_filename);
    }

    // Update database if we have changes
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('media_library')
        .update(updates)
        .eq('id', mediaId);

      if (updateError) {
        return {
          success: false,
          mediaId,
          error: updateError.message,
        };
      }
    }

    return {
      success: true,
      mediaId,
      updates: Object.keys(updates).length > 0 ? updates : undefined,
    };
  } catch (error) {
    return {
      success: false,
      mediaId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reprocess metadata for multiple media items
 */
export async function reprocessBulkMetadata(
  mediaIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<ReprocessResult[]> {
  const results: ReprocessResult[] = [];

  for (let i = 0; i < mediaIds.length; i++) {
    const result = await reprocessMediaMetadata(mediaIds[i]);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, mediaIds.length);
    }
  }

  return results;
}

/**
 * Find media items with missing metadata
 */
export async function findMediaWithMissingMetadata() {
  const { data, error } = await supabase
    .from('media_library')
    .select('id, title, type, file_size, width, height, thumbnail_url, original_filename')
    .or('file_size.is.null,thumbnail_url.is.null')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to find media with missing metadata:', error);
    return [];
  }

  return data || [];
}
