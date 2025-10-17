// Unified Supabase storage configuration
// Single source of truth for all media storage

export const UNIFIED_STORAGE = {
  // Main media bucket - all user uploads (PUBLIC)
  'media-files': {
    name: 'media-files',
    bucketName: 'media-files',
    public: true,
    folders: {
      SUBMISSIONS: 'submissions',
      PROJECTS: 'projects',
      PARTICIPANTS: 'participants',
      SPONSORS: 'sponsors',
      ADMIN: 'admin',
      GENERAL: 'general'
    } as const,
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 
                   'video/mp4', 'video/webm', 'video/quicktime',
                   'audio/mpeg', 'audio/wav', 'audio/ogg',
                   'application/pdf'] as const
  },
  
  // Private documents bucket
  'documents': {
    name: 'documents',
    bucketName: 'documents',
    public: false,
    folders: {
      CONTRACTS: 'contracts',
      INTERNAL: 'internal',
      SENSITIVE: 'sensitive'
    } as const,
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                   'text/plain', 'text/csv'] as const
  }
} as const;

// Legacy bucket configuration (kept for backwards compatibility during migration)
export const STORAGE_BUCKETS = {
  participants: {
    name: 'participants',
    bucketName: 'participant-avatars',
    localPath: '/images/participants/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '5MB'
  },
  projects: {
    name: 'projects',
    bucketName: 'project-images',
    localPath: '/images/projects/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '10MB'
  },
  partners: {
    name: 'partners',
    bucketName: 'sponsor-logos',
    localPath: '/images/partners/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '2MB'
  },
  ui: {
    name: 'ui',
    bucketName: 'ui',
    localPath: '/images/ui/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '1MB'
  }
} as const;

// Placeholder asset paths - Export for assetHelpers.ts
export const PLACEHOLDER_ASSETS = {
  participant: '/images/participants/placeholder-avatar.svg',
  project: '/images/projects/placeholder-project.svg',
  partner: '/images/partners/placeholder-logo.svg',
  ui: '/images/ui/placeholder.svg'
} as const;

// Unified storage helper functions
export const getUnifiedStorageUrl = (
  bucket: keyof typeof UNIFIED_STORAGE,
  folder: string,
  filename: string
): string => {
  const bucketConfig = UNIFIED_STORAGE[bucket];
  return `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${bucketConfig.bucketName}/${folder}/${filename}`;
};

export const validateFileType = (
  bucket: keyof typeof UNIFIED_STORAGE,
  mimeType: string
): boolean => {
  const bucketConfig = UNIFIED_STORAGE[bucket];
  return (bucketConfig.allowedTypes as readonly string[]).includes(mimeType);
};

export const validateFileSize = (
  bucket: keyof typeof UNIFIED_STORAGE,
  fileSize: number
): boolean => {
  const bucketConfig = UNIFIED_STORAGE[bucket];
  return fileSize <= bucketConfig.maxSize;
};

// Legacy helper functions (kept for backwards compatibility)
export const getStoragePath = (bucket: keyof typeof STORAGE_BUCKETS, filename: string): string => {
  const bucketConfig = STORAGE_BUCKETS[bucket];
  return `${bucketConfig.localPath}${filename}`;
};

export const getSupabaseStorageUrl = (bucket: keyof typeof STORAGE_BUCKETS, filename: string): string => {
  const bucketConfig = STORAGE_BUCKETS[bucket];
  return `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${bucketConfig.bucketName}/${filename}`;
};

export const getLocalStorageUrl = (bucket: keyof typeof STORAGE_BUCKETS, filename: string): string => {
  return getStoragePath(bucket, filename);
};

export const getFullAssetUrl = (bucket: keyof typeof STORAGE_BUCKETS, filename: string): string => {
  const bucketConfig = STORAGE_BUCKETS[bucket];
  return `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${bucketConfig.bucketName}/${filename}`;
};
