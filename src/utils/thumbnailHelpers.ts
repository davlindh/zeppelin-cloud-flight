/**
 * Thumbnail generation and URL helpers
 * Optimizes media loading by providing smaller preview images
 */

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
}

/**
 * Generate thumbnail URL for Supabase storage images
 * Falls back to original URL if transformation not possible
 */
export function getThumbnailUrl(
  originalUrl: string,
  options: ThumbnailOptions = {}
): string {
  const {
    width = 400,
    height,
    quality = 75,
    format = 'webp'
  } = options;

  // Check if URL is from Supabase storage
  if (originalUrl.includes('supabase.co/storage')) {
    try {
      const url = new URL(originalUrl);
      // Add transformation params
      url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', format);
      return url.toString();
    } catch (error) {
      console.warn('Failed to generate thumbnail URL:', error);
      return originalUrl;
    }
  }

  // For external URLs or non-transformable sources, return original
  return originalUrl;
}

/**
 * Get optimized image URL based on viewport size
 */
export function getResponsiveImageUrl(
  originalUrl: string,
  viewportWidth: number
): string {
  // Determine appropriate size based on viewport
  const size = 
    viewportWidth <= 640 ? 640 :
    viewportWidth <= 768 ? 768 :
    viewportWidth <= 1024 ? 1024 :
    viewportWidth <= 1280 ? 1280 :
    1920;

  return getThumbnailUrl(originalUrl, { width: size, quality: 80 });
}

/**
 * Generate placeholder blur data URL
 * Creates a tiny base64 image for blur-up effect
 */
export function generatePlaceholderDataUrl(
  width: number = 10,
  height: number = 10,
  color: string = '#e5e7eb'
): string {
  // Create a minimal SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Check if URL is an image that can be optimized
 */
export function isOptimizableImage(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  originalUrl: string,
  sizes: number[] = [640, 750, 828, 1080, 1200, 1920]
): string {
  if (!isOptimizableImage(originalUrl)) {
    return '';
  }

  return sizes
    .map(size => {
      const url = getThumbnailUrl(originalUrl, { width: size });
      return `${url} ${size}w`;
    })
    .join(', ');
}
