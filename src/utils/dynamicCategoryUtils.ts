
import { useDynamicCategories } from '@/hooks/useDynamicCategories';
import * as LucideIcons from 'lucide-react';
import React from 'react';

interface CategoryColors {
  bg: string;
  text: string;
  border: string;
  accent?: string;
  mood?: string;
}

// Comprehensive default mappings for any category
export const getDefaultCategoryColors = (categoryName: string): CategoryColors => {
  const colorMap: Record<string, CategoryColors> = {
    electronics: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    fashion: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    home: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    sports: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    books: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    art: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    collectibles: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    automotive: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    jewelry: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    antiques: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    music: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    tools: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  };

  // Return specific colors if found, otherwise generate based on hash
  if (colorMap[categoryName]) {
    return colorMap[categoryName];
  }

  // Generate consistent colors for unknown categories
  const hash = categoryName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const colorVariants = [
    { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
    { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200' },
    { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
    { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  ];

  return colorVariants[Math.abs(hash) % colorVariants.length] as CategoryColors;
};

export const getDefaultCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    electronics: '📱',
    fashion: '👕',
    home: '🏠',
    sports: '🏆',
    books: '📚',
    art: '🎨',
    collectibles: '⭐',
    automotive: '🚗',
    jewelry: '💎',
    antiques: '🕰️',
    music: '🎵',
    tools: '🔧',
  };

  return iconMap[categoryName] ?? '📦';
};

export const getCategoryColorsFromMetadata = (metadata?: any): CategoryColors => {
  if (metadata?.color_scheme) {
    const colorScheme = metadata.color_scheme;
    
    // Validate the color scheme has required properties
    if (colorScheme.bg && colorScheme.text && colorScheme.border) {
      return {
        bg: colorScheme.bg,
        text: colorScheme.text,
        border: colorScheme.border,
        accent: colorScheme.accent,
        mood: colorScheme.mood
      };
    }
  }
  
  return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
};

// Safe Lucide icon component creator with better error handling
const createLucideIcon = (iconName: string): React.ReactElement | null => {
  try {
    // Clean the icon name (remove spaces, hyphens, make PascalCase)
    const cleanIconName = (iconName || '')
      .replace(/[-_\s]/g, '')
      .replace(/^./, str => str.toUpperCase())
      .replace(/[a-z][A-Z]/g, match => (match[0] || '') + (match[1]?.toUpperCase() || ''));
    
    const IconComponent = (LucideIcons as any)[cleanIconName];
    if (IconComponent && typeof IconComponent === 'function') {
      return React.createElement(IconComponent, { className: 'w-8 h-8' });
    }
  } catch (error) {
    console.warn(`Failed to load Lucide icon: ${iconName}`, error);
  }
  return null;
};

export const getCategoryIconFromMetadata = (metadata?: any, categoryName?: string): React.ReactElement | string => {
  // Try to use Lucide icon from metadata first
  if (metadata?.icon_name) {
    const lucideIcon = createLucideIcon(metadata.icon_name);
    if (lucideIcon) {
      return lucideIcon;
    }
  }
  
  // Fallback to emoji icons
  return getDefaultCategoryIcon(categoryName ?? '');
};

// Hook to get category information by name with comprehensive fallbacks
export const useCategoryInfo = (categoryName: string) => {
  const { data: categories, isError } = useDynamicCategories();
  
  // Find category in database data
  const category = categories?.find(cat => cat.name === categoryName);
  
  // Get colors - prefer metadata, fallback to defaults
  const colors = category?.metadata?.color_scheme 
    ? getCategoryColorsFromMetadata(category.metadata)
    : getDefaultCategoryColors(categoryName);
  
  // Get icon - prefer metadata, fallback to defaults
  const icon = category?.metadata?.icon_name 
    ? getCategoryIconFromMetadata(category?.metadata, categoryName)
    : getDefaultCategoryIcon(categoryName);
  
  // Get display name - prefer database, fallback to formatted category name
  const displayName = category?.display_name ?? 
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace(/[-_]/g, ' ');
  
  // Get description - use database or provide generic fallback
  const description = category?.description ?? 
    `Items in the ${displayName.toLowerCase()} category`;
  
  return {
    category,
    colors,
    icon,
    displayName,
    description,
    isFromDatabase: !!category,
    isDatabaseError: isError
  };
};

// Utility to ensure category name is valid
export const normalizeCategoryName = (categoryName: string): string => {
  if (!categoryName || categoryName === 'all') return 'all';
  return categoryName.toLowerCase().trim();
};

// Get safe category list for filters
export const getSafeCategoryList = (categories?: any[]): string[] => {
  const baseFallback = ['all', 'electronics', 'fashion', 'home', 'sports', 'books', 'art'];
  
  if (!categories || categories.length === 0) {
    return baseFallback;
  }
  
  try {
    return ['all', ...categories.map(cat => cat.name).filter(Boolean)];
  } catch (error) {
    console.warn('Error processing categories for filter list:', error);
    return baseFallback;
  }
};
