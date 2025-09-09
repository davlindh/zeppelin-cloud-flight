import { getFullAssetUrl, PLACEHOLDER_ASSETS } from './storage';

// Legacy asset mappings - kept for backwards compatibility
// New code should use the storage system from constants/storage.ts
export const ASSET_PATHS = {
  // Participant avatars - migrated to normalized structure
  participants: {
    'irina-novokrescionova': '/images/participants/irina-novokrescionova.jpg',
  },
  
  // Project images - migrated to normalized structure  
  projects: {
    'cooking-potato': '/images/projects/cooking-potato.jpg',
    'irina-portrait': '/images/projects/irina-novokrescionova.jpg',
  },
  
  // Partner logos - migrated to normalized structure
  partners: {
    'karlskrona-kommun': '/images/partners/karlskrona-kommun-logo.png',
    'maskin-fritid': '/images/partners/maskin-fritid-logo.png',
    'stenbracka': '/images/partners/stenbracka-logo.png',
    'visit-blekinge': '/images/partners/visit-blekinge-logo.png',
  },
  
  // UI placeholders - now using proper SVG placeholders
  ui: {
    'placeholder-project': '/images/ui/placeholder-project.svg',
    'placeholder-avatar': '/images/ui/placeholder-avatar.svg',
  }
};

// Legacy helper function - kept for backwards compatibility
export const getAssetPath = (category: keyof typeof ASSET_PATHS, key: string): string => {
  const categoryAssets = ASSET_PATHS[category] as Record<string, string>;
  return categoryAssets[key] || ASSET_PATHS.ui['placeholder-project'];
};

// New recommended approach using storage buckets
export { getFullAssetUrl, PLACEHOLDER_ASSETS } from './storage';