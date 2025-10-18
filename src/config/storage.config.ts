// Centralized storage configuration to ensure consistency

/**
 * Bucket mapping for all entity types
 * Maps entity types to their corresponding Supabase storage buckets
 */
export const BUCKET_MAP = {
  PRODUCTS: 'product-images',
  AUCTIONS: 'auction-images',
  SERVICES: 'service-images',
  PROVIDERS: 'provider-avatars',
  MEDIA: 'media-files',
  PROJECTS: 'project-images',
  PARTICIPANTS: 'participant-avatars',
  SPONSORS: 'sponsor-logos',
  UI: 'ui',
  DOCUMENTS: 'documents',
} as const;

/**
 * Get the appropriate bucket for an entity type
 */
export const getBucketForEntity = (entityType: keyof typeof BUCKET_MAP): string => {
  return BUCKET_MAP[entityType];
};

export const STORAGE_CONFIG = {
  // Default bucket for general uploads
  DEFAULT_BUCKET: 'media-files' as const,
  
  // Folder structure (deprecated - use specific buckets instead)
  FOLDERS: {
    ADMIN: 'admin',
    PRODUCTS: 'products', 
    AUCTIONS: 'auctions',
    SERVICES: 'services',
    PROVIDERS: 'providers',
    AVATARS: 'avatars',
    GENERAL: 'general',
  } as const,

  // File size limits (in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Image optimization settings
  IMAGE_OPTIMIZATION: {
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    QUALITY: 0.8,
    FORMAT: 'image/jpeg' as const,
  },

  // Cache settings
  CACHE_CONTROL: '3600', // 1 hour
  
  // Allowed file types
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ] as const,
} as const;

/**
 * Get the appropriate folder for an entity type
 * @deprecated Use getBucketForEntity instead - folders are no longer needed with specific buckets
 */
export const getFolderForEntity = (entityType: 'product' | 'auction' | 'service' | 'provider' | 'admin'): string => {
  switch (entityType) {
    case 'product':
      return STORAGE_CONFIG.FOLDERS.PRODUCTS;
    case 'auction':
      return STORAGE_CONFIG.FOLDERS.AUCTIONS;
    case 'service':
      return STORAGE_CONFIG.FOLDERS.SERVICES;
    case 'provider':
      return STORAGE_CONFIG.FOLDERS.PROVIDERS;
    case 'admin':
    default:
      return STORAGE_CONFIG.FOLDERS.ADMIN;
  }
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Please use: ${STORAGE_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB)`
    };
  }

  return { valid: true };
};