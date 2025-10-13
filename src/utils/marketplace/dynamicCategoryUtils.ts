import React from 'react';
import * as LucideIcons from 'lucide-react';
import { useDynamicCategories } from '@/hooks/marketplace/useDynamicCategories';

interface CategoryColors {
  bg: string;
  text: string;
  border: string;
  accent?: string;
  mood?: string;
}

const DEFAULT_COLOR_MAP: Record<string, CategoryColors> = {
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

const GENERATED_COLOR_VARIANTS: CategoryColors[] = [
  { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  { bg: 'bg-zinc-50', text: 'text-zinc-700', border: 'border-zinc-200' },
  { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
  { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
];

const DEFAULT_ICON_MAP: Record<string, string> = {
  electronics: '🔌',
  fashion: '👗',
  home: '🏠',
  sports: '⚽',
  books: '📚',
  art: '🎨',
  collectibles: '🗃️',
  automotive: '🚗',
  jewelry: '💍',
  antiques: '🕰️',
  music: '🎵',
  tools: '🔧',
};

const formatIconName = (iconName: string) =>
  iconName
    .replace(/[-_\s]+(.)?/g, (_, chr: string) => (chr ? chr.toUpperCase() : ''))
    .replace(/^./, str => str.toUpperCase());

export const getDefaultCategoryColors = (categoryName: string): CategoryColors => {
  const normalized = categoryName.toLowerCase();

  if (DEFAULT_COLOR_MAP[normalized]) {
    return DEFAULT_COLOR_MAP[normalized];
  }

  const hash = normalized
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) & 0xffff, 0);

  return GENERATED_COLOR_VARIANTS[Math.abs(hash) % GENERATED_COLOR_VARIANTS.length];
};

export const getDefaultCategoryIcon = (categoryName: string): string => {
  const normalized = categoryName.toLowerCase();
  return DEFAULT_ICON_MAP[normalized] ?? '🛍️';
};

export const getCategoryColorsFromMetadata = (metadata?: any): CategoryColors => {
  if (metadata?.color_scheme) {
    const { bg, text, border, accent, mood } = metadata.color_scheme;
    if (bg && text && border) {
      return { bg, text, border, accent, mood };
    }
  }

  return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
};

const createLucideIcon = (iconName: string): React.ReactElement | null => {
  if (!iconName) {
    return null;
  }

  try {
    const formattedName = formatIconName(iconName);
    const Icon = (LucideIcons as any)[formattedName];
    if (Icon) {
      return React.createElement(Icon, { className: 'h-8 w-8' } as any);
    }
  } catch (error) {
    console.warn(`[dynamicCategoryUtils] Failed to load Lucide icon "${iconName}"`, error);
  }

  return null;
};

export const getCategoryIconFromMetadata = (
  metadata?: any,
  categoryName?: string
): React.ReactElement | string => {
  if (metadata?.icon_name) {
    const lucideIcon = createLucideIcon(metadata.icon_name);
    if (lucideIcon) {
      return lucideIcon;
    }
  }

  return getDefaultCategoryIcon(categoryName ?? 'general');
};

export const useCategoryInfo = (categoryName: string) => {
  const normalized = categoryName.toLowerCase();
  const { data: categories, isError } = useDynamicCategories();

  const category = categories?.find(cat => cat.name === normalized);

  const colors = category?.metadata?.color_scheme
    ? getCategoryColorsFromMetadata(category.metadata)
    : getDefaultCategoryColors(normalized);

  const icon = category?.metadata?.icon_name
    ? getCategoryIconFromMetadata(category.metadata, normalized)
    : getDefaultCategoryIcon(normalized);

  const displayName =
    category?.display_name ?? normalized.replace(/[-_]/g, ' ').replace(/^./, str => str.toUpperCase());

  const description =
    category?.description ?? `Items in the ${displayName.toLowerCase()} category`;

  return {
    category,
    colors,
    icon,
    displayName,
    description,
    isFromDatabase: Boolean(category),
    isDatabaseError: isError,
  };
};

export const normalizeCategoryName = (categoryName: string): string => {
  if (!categoryName || categoryName === 'all') {
    return 'all';
  }

  return categoryName.toLowerCase().trim();
};

export const getSafeCategoryList = (categories?: string[] | Array<{ name: string }>): string[] => {
  const baseFallback = ['all', 'electronics', 'fashion', 'home', 'sports', 'books', 'art'];

  if (!categories || categories.length === 0) {
    return baseFallback;
  }

  try {
    // Handle both string[] and { name: string }[] formats
    if (typeof categories[0] === 'string') {
      return ['all', ...(categories as string[])];
    }
    
    const dynamicCategories = (categories as Array<{ name: string }>)
      .map(category => category.name)
      .filter((name): name is string => Boolean(name));

    return ['all', ...dynamicCategories];
  } catch (error) {
    console.warn('[dynamicCategoryUtils] Failed to process dynamic category list', error);
    return baseFallback;
  }
};
