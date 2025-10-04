/**
 * Organized file naming system for Supabase storage
 * Provides structured, searchable file names with context information
 */

export interface FileNamingContext {
  uploader: 'participant' | 'sponsor' | 'admin' | 'project-owner' | 'user';
  submissionType?: 'cv' | 'portfolio' | 'references' | 'logo' | 'image' | 'document' | 'video' | 'audio';
  submissionId?: string;
  userId?: string;
  originalName?: string;
}

export interface OrganizedFileName {
  fullPath: string; // Path within bucket (with folders)
  fileName: string; // Just the filename
  bucket: string; // Which bucket it should go in
}

/**
 * Generate a clean, URL-safe filename from original filename
 */
export const generateCleanFileName = (originalName: string, maxLength: number = 50): string => {
  return originalName
    .replace(/[^a-zA-Z0-9._-]/g, '-') // Replace special chars with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, maxLength) // Limit length
    .toLowerCase();
};

/**
 * Generate organized file path and name
 */
export const generateOrganizedFileName = (
  originalFile: File,
  context: FileNamingContext
): OrganizedFileName => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8); // 6 chars
  const fileExt = originalFile.name.split('.').pop()?.toLowerCase() || 'unknown';

  // Clean original filename for readability
  const cleanOriginalName = context.originalName
    ? generateCleanFileName(context.originalName.replace(/\.[^/.]+$/, ''), 30)
    : '';

  // Build descriptive name components
  const nameParts = [
    context.submissionType,
    context.uploader,
    context.userId ? context.userId.slice(0, 8) : '', // Shorten IDs for readability
    context.submissionId ? context.submissionId.slice(0, 8) : '',
  ].filter(Boolean); // Remove empty parts

  // Add clean original name if provided and different from extension
  if (cleanOriginalName && cleanOriginalName !== fileExt) {
    nameParts.push(cleanOriginalName);
  }

  // Always add timestamp and random ID for uniqueness
  nameParts.push(timestamp.toString(), randomId);

  const fileName = `${nameParts.join('-')}.${fileExt}`;

  // Determine bucket based on context
  const bucket = getBucketForContext(context);

  // Create folder structure within bucket
  const folderPath = generateFolderPath(context);

  return {
    fullPath: folderPath ? `${folderPath}/${fileName}` : fileName,
    fileName,
    bucket
  };
};

/**
 * Get bucket for document-type files
 */
const getDocumentBucket = (context: FileNamingContext): string => {
  switch (context.submissionType) {
    case 'cv':
    case 'portfolio':
    case 'references':
    case 'document':
      return 'documents';
    default:
      return getDefaultBucket(context);
  }
};

/**
 * Get bucket for image-type files
 */
const getImageBucket = (context: FileNamingContext): string => {
  switch (context.uploader) {
    case 'sponsor':
      return 'sponsor-logos';
    case 'project-owner':
    case 'admin':
      return 'project-images';
    case 'participant':
      return 'participant-avatars';
    default:
      return 'media';
  }
};

/**
 * Get bucket for media-type files
 */
const getMediaBucketByType = (context: FileNamingContext): string => {
  switch (context.submissionType) {
    case 'video':
      return 'videos';
    case 'audio':
      return 'audio';
    default:
      return getDefaultBucket(context);
  }
};

/**
 * Get default bucket based on uploader type
 */
const getDefaultBucket = (context: FileNamingContext): string => {
  switch (context.uploader) {
    case 'participant':
      return 'participants';
    case 'project-owner':
    case 'admin':
      return 'projects';
    case 'sponsor':
      return 'partners';
    default:
      return 'media';
  }
};

/**
 * Get appropriate bucket for the given context
 */
export const getBucketForContext = (context: FileNamingContext): string => {
  // Route different file types to appropriate buckets

  switch (context.submissionType) {
    case 'cv':
    case 'portfolio':
    case 'references':
    case 'document':
      return getDocumentBucket(context);

    case 'logo':
    case 'image':
      return getImageBucket(context);

    case 'video':
    case 'audio':
      return getMediaBucketByType(context);

    default:
      return getDefaultBucket(context);
  }
};

/**
 * Generate folder structure for organization
 */
export const generateFolderPath = (context: FileNamingContext): string => {
  // For media-files bucket, use flat structure to match Supabase storage
  // The media-files bucket doesn't have nested folders, so return empty string
  if (getBucketForContext(context) === 'media-files') {
    return '';
  }

  // For other buckets, use date-based folder structure (YYYY/MM)
  const date = new Date();
  const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;

  const parts = [datePath, context.uploader];

  if (context.submissionType) {
    parts.push(context.submissionType);
  }

  if (context.userId) {
    parts.push(context.userId.slice(0, 8)); // Keep user IDs short
  }

  return parts.join('/');
};

/**
 * Generate multiple possible URLs for a file (for backward compatibility)
 * This handles both old nested paths and new flat paths
 */
export const generatePossibleUrls = (bucketName: string, fileName: string): string[] => {
  const urls: string[] = [];

  // Add the current flat structure URL
  urls.push(fileName);

  // Add possible old nested structure URLs
  if (bucketName === 'media-files') {
    // Old structure might have had media/ prefix
    urls.push(`media/${fileName}`);
    urls.push(`submissions/${fileName}`);
  }

  return urls;
};

/**
 * Try to find a working URL from multiple possible URLs
 */
export const findWorkingUrl = async (bucketName: string, fileName: string): Promise<string | null> => {
  const possibleUrls = generatePossibleUrls(bucketName, fileName);

  for (const url of possibleUrls) {
    try {
      // Try to check if the file exists by making a HEAD request
      const response = await fetch(`https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${bucketName}/${url}`, {
        method: 'HEAD'
      });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      // Continue to next URL
      continue;
    }
  }

  return null;
};

/**
 * Get the correct public URL for a file, handling both old and new path structures
 */
export const getCorrectedFileUrl = (bucketName: string, filePath: string): string => {
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // For media-files bucket, ensure flat structure
  if (bucketName === 'media-files') {
    // Remove any folder prefixes that might have been added incorrectly
    const cleanPath = filePath.replace(/^media\//, '').replace(/^submissions\//, '');
    return `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${bucketName}/${cleanPath}`;
  }

  // For other buckets, use the path as is
  return `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`;
};

/**
 * Legacy compatibility - simple unique filename generation
 */
export const generateSimpleFileName = (file: File): string => {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomId}.${fileExt}`;
};

/**
 * Extract metadata from organized filename
 */
export const parseOrganizedFileName = (fileName: string): Partial<FileNamingContext> => {
  // Expected format: type-uploader-userId-timestamp-random.ext
  // Example: cv-participant-12345-resume-1726632245-a1b2c3.pdf

  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const parts = nameWithoutExt.split('-');

  if (parts.length < 4) {
    return {}; // Not an organized filename
  }

  const [submissionType, uploader, userId, ...rest] = parts;
  const timestamp = rest.find(part => /^\d{13}$/.test(part)); // Find 13-digit timestamp

  return {
    submissionType: submissionType as FileNamingContext['submissionType'],
    uploader: uploader as FileNamingContext['uploader'],
    userId,
    // Cannot reliably extract submissionId from this format
  };
};
