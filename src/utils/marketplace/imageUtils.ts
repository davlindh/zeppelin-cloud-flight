export const getImageUrl = (imageId?: string | null): string => {
  if (!imageId || imageId === '') {
    return '/placeholder.svg';
  }
  
  // Handle full URLs (already formatted)
  if (imageId.startsWith('http')) {
    return imageId;
  }
  
  // Handle Supabase storage URLs that start with the storage path
  if (imageId.startsWith('/storage/') || imageId.includes('supabase')) {
    return imageId;
  }

  // Handle paths that are just file names - convert to full Supabase storage URL
  if (!imageId.startsWith('http') && !imageId.includes('storage')) {
    return `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/auction-images/${imageId}`;
  }
  
  // Fallback to placeholder
  return '/placeholder.svg';
};

// Extract storage path from public URL for deletion
export const getStoragePathFromPublicUrl = (publicUrl: string): string | null => {
  if (!publicUrl || !publicUrl.includes('supabase.co/storage/v1/object/public/')) {
    return null;
  }
  
  const parts = publicUrl.split('/storage/v1/object/public/');
  if (parts.length !== 2 || !parts[1]) return null;
  
  const pathWithBucket = parts[1];
  const pathParts = pathWithBucket.split('/');
  if (pathParts.length < 2) return null;
  
  // Remove bucket name and return the path
  return pathParts.slice(1).join('/');
};

export const getImageAlt = (title: string, type: 'product' | 'auction' | 'service' = 'product'): string => {
  return `${title} - ${type} image`;
};

// New responsive image utilities
export const getResponsiveImageSizes = () => {
  return {
    mobile: { width: 400, height: 300 },
    tablet: { width: 600, height: 400 },
    desktop: { width: 800, height: 600 },
    large: { width: 1200, height: 800 }
  };
};

export const getResponsiveImageUrl = (imageId?: string | null): string => {
  return getImageUrl(imageId);
};

// Preload utility for critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Helper to check if an item has images
export const hasImages = (item: { image?: string | null; images?: string[] | null }): boolean => {
  const hasMainImage = item.image && item.image !== '' && item.image !== '/placeholder.svg';
  const hasGalleryImages =
    item.images &&
    item.images.length > 0 &&
    item.images.some(img => img !== '' && img !== '/placeholder.svg');
  return !!(hasMainImage || hasGalleryImages);
};

// Helper to get image count
export const getImageCount = (item: { image?: string | null; images?: string[] | null }): number => {
  let count = 0;
  if (item.image && item.image !== '' && item.image !== '/placeholder.svg') count++;
  if (item.images) {
    count += item.images.filter(img => img !== '' && img !== '/placeholder.svg').length;
  }
  return count;
};
