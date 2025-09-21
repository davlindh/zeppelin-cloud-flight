// Imaginary storage buckets configuration
// This simulates a cloud storage structure for assets

export const STORAGE_BUCKETS = {
  // Main asset buckets
  participants: {
    name: 'participants',
    basePath: '/images/participants/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '5MB'
  },
  
  projects: {
    name: 'projects', 
    basePath: '/images/projects/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '10MB'
  },
  
  partners: {
    name: 'partners',
    basePath: '/images/partners/', 
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '2MB'
  },
  
  // UI and system assets
  ui: {
    name: 'ui',
    basePath: '/images/ui/',
    allowedTypes: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    maxSize: '1MB'
  },
  
  // Rich multimedia buckets
  videos: {
    name: 'videos',
    basePath: '/media/videos/',
    allowedTypes: ['mp4', 'webm', 'mov', 'avi'],
    maxSize: '100MB'
  },
  
  audio: {
    name: 'audio',
    basePath: '/media/audio/',
    allowedTypes: ['mp3', 'wav', 'flac', 'ogg'],
    maxSize: '25MB'
  },
  
  documents: {
    name: 'documents',
    basePath: '/media/documents/',
    allowedTypes: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    maxSize: '10MB'
  },
  
  // Legacy media bucket for backward compatibility
  media: {
    name: 'media',
    basePath: '/media/',
    allowedTypes: ['mp4', 'webm', 'mp3', 'wav', 'pdf', 'doc', 'docx'],
    maxSize: '50MB'
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
  return `${bucketConfig.basePath}${filename}`;
};

export const getFullAssetUrl = (bucket: keyof typeof STORAGE_BUCKETS, filename: string): string => {
  return getStoragePath(bucket, filename);
};

export const validateFileType = (bucket: keyof typeof STORAGE_BUCKETS, filename: string): boolean => {
  const bucketConfig = STORAGE_BUCKETS[bucket];
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? (bucketConfig.allowedTypes as readonly string[]).includes(extension) : false;
};
