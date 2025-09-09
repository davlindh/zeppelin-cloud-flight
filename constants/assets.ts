// Local asset mappings for participants and projects
export const ASSET_PATHS = {
  // Participant avatars
  participants: {
    'irina-novokrescionova': '/images/projects/irina-novokrescionova.jpg',
  },
  
  // Project images
  projects: {
    'cooking-potato': '/images/projects/cooking-potato.jpg',
    'irina-portrait': '/images/projects/irina-novokrescionova.jpg',
  },
  
  // Partner logos
  partners: {
    'karlskrona-kommun': '/images/partners/karlskrona-kommun-logo.png',
    'maskin-fritid': '/images/partners/maskin-fritid-logo.png',
    'stenbracka': '/images/partners/stenbracka-logo.png',
    'visit-blekinge': '/images/partners/visit-blekinge-logo.png',
  },
  
  // UI placeholders
  ui: {
    'placeholder-project': '/images/ui/placeholder-project.jpg',
    'placeholder-avatar': '/images/ui/placeholder-avatar.svg',
  }
};

// Helper function to get asset path
export const getAssetPath = (category: keyof typeof ASSET_PATHS, key: string): string => {
  const categoryAssets = ASSET_PATHS[category] as Record<string, string>;
  return categoryAssets[key] || ASSET_PATHS.ui['placeholder-project'];
};