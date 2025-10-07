/**
 * URL Helper utilities for consistent URL generation across the application
 */

/**
 * Generate a project detail URL using slug
 * @param slug - The project slug
 * @returns The complete URL path for the project detail page
 */
export const getProjectDetailUrl = (slug: string): string => {
  if (!slug) {
    console.warn('getProjectDetailUrl: slug is required');
    return '/showcase';
  }
  return `/showcase/${slug}`;
};

/**
 * Generate a project edit URL for admin
 * @param slug - The project slug
 * @returns The complete URL path for the project edit page
 */
export const getProjectEditUrl = (slug: string): string => {
  if (!slug) {
    console.warn('getProjectEditUrl: slug is required');
    return '/admin/projects';
  }
  return `/admin/projects/${slug}/edit`;
};

/**
 * Generate a participant detail URL using slug
 * @param slug - The participant slug
 * @returns The complete URL path for the participant detail page
 */
export const getParticipantDetailUrl = (slug: string): string => {
  if (!slug) {
    console.warn('getParticipantDetailUrl: slug is required');
    return '/participants';
  }
  return `/participants/${slug}`;
};

/**
 * Generate a participant edit URL for admin
 * @param id - The participant ID
 * @returns The complete URL path for the participant edit page
 */
export const getParticipantEditUrl = (id: string): string => {
  if (!id) {
    console.warn('getParticipantEditUrl: id is required');
    return '/admin/participants';
  }
  return `/admin/participants/${id}/edit`;
};

/**
 * Check if a string is a valid UUID format
 * @param str - The string to check
 * @returns True if the string is a valid UUID format
 */
export const isUUID = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Generate a slug from a title (basic implementation)
 * @param title - The title to convert to a slug
 * @returns A URL-friendly slug
 */
export const generateSlug = (title: string): string => {
  if (!title) return '';

  return title
    .toLowerCase()
    .trim()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Get the current page URL
 * @returns The current page URL
 */
export const getCurrentUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

/**
 * Get the current page path
 * @returns The current page path
 */
export const getCurrentPath = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '';
};
