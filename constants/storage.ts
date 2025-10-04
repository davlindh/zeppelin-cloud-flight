// Supabase storage buckets configuration
// Real buckets that correspond to actual Supabase storage

export const STORAGE_BUCKETS = {
  // Main asset buckets - these correspond to real Supabase storage buckets
  participants: {
    name: 'participants',
    bucketName: 'participants',
    localPath: '/images/participants/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '5MB'
  },

  projects: {
    name: 'projects',
    bucketName: 'projects',
    localPath: '/images/projects/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '10MB'
  },

  partners: {
    name: 'partners',
    bucketName: 'partners',
    localPath: '/images/partners/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '2MB'
  },

  // UI and system assets
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

// Helper functions for storage operations
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
  // Try Supabase storage first, fallback to local
  const bucketConfig = STORAGE_BUCKETS[bucket];
  return `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/${bucketConfig.bucketName}/${filename}`;
};

export const validateFileType = (bucket: keyof typeof STORAGE_BUCKETS, filename: string): boolean => {
  const bucketConfig = STORAGE_BUCKETS[bucket];
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? (bucketConfig.allowedTypes as readonly string[]).includes(extension) : false;
};
