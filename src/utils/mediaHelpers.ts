import React from 'react';
import { Play, FileText, Image, Headphones, Video, File, User, Palette, Settings, Star, Archive, Code, Box, Monitor } from 'lucide-react';
import type { MediaType, MediaCategory } from '@/types/media';
import type { UnifiedMediaItem, MediaFilters, MediaCollection } from '@/types/unified-media';

export const getMediaIcon = (type: MediaType, size: string = 'w-5 h-5') => {
  const props = { className: size };
  switch (type) {
    case 'video': return React.createElement(Play, props);
    case 'audio': return React.createElement(Headphones, props);
    case 'image': 
    case 'portfolio': return React.createElement(Image, props);
    case 'document': return React.createElement(FileText, props);
    case 'pdf': return React.createElement(FileText, props);
    case 'presentation': return React.createElement(Monitor, props);
    case 'archive': return React.createElement(Archive, props);
    case 'code': return React.createElement(Code, props);
    case '3d': return React.createElement(Box, props);
    default: return React.createElement(File, props);
  }
};

export const getMediaTypeColor = (type: MediaType) => {
  switch (type) {
    case 'video': return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800';
    case 'audio': return 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800';
    case 'image': 
    case 'portfolio': return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800';
    case 'document': return 'bg-muted text-muted-foreground border-border';
    case 'pdf': return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800';
    case 'presentation': return 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800';
    case 'archive': return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800';
    case 'code': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800';
    case '3d': return 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-800';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const getMediaTypeName = (type: MediaType): string => {
  switch (type) {
    case 'video': return 'Video';
    case 'audio': return 'Ljud';
    case 'image': return 'Bild';
    case 'portfolio': return 'Portfolio';
    case 'document': return 'Dokument';
    case 'pdf': return 'PDF';
    case 'presentation': return 'Presentation';
    case 'archive': return 'Arkiv';
    case 'code': return 'Kod';
    case '3d': return '3D-modell';
    default: return type;
  }
};

export const getCategoryIcon = (category: MediaCategory, size: string = 'w-4 h-4') => {
  const props = { className: size };
  switch (category) {
    case 'featured': return React.createElement(Star, props);
    case 'process': return React.createElement(Settings, props);
    case 'archive': return React.createElement(File, props);
    case 'collaboration': return React.createElement(User, props);
    case 'promotional': return React.createElement(Video, props);
    case 'technical': return React.createElement(Settings, props);
    case 'artistic': return React.createElement(Palette, props);
    default: return React.createElement(File, props);
  }
};

export const getCategoryColor = (category: MediaCategory) => {
  switch (category) {
    case 'featured': return 'bg-primary/10 text-primary border-primary/20';
    case 'process': return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
    case 'archive': return 'bg-muted/10 text-muted-foreground border-muted/20';
    case 'collaboration': return 'bg-accent/10 text-accent-foreground border-accent/20';
    case 'promotional': return 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800';
    case 'technical': return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800';
    case 'artistic': return 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950 dark:text-pink-400 dark:border-pink-800';
    default: return 'bg-muted/10 text-muted-foreground border-muted/20';
  }
};

export const getCategoryLabel = (category: MediaCategory): string => {
  switch (category) {
    case 'featured': return 'Utvalt';
    case 'process': return 'Process';
    case 'archive': return 'Arkiv';
    case 'collaboration': return 'Samarbete';
    case 'promotional': return 'Marknadsföring';
    case 'technical': return 'Teknisk';
    case 'artistic': return 'Konstnärlig';
    default: return category;
  }
};

export const isPlayableMedia = (type: MediaType): boolean => {
  return type === 'video' || type === 'audio';
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getMediaPreviewUrl = (url: string, type: MediaType): string => {
  // For images, return the original URL
  if (type === 'image' || type === 'portfolio') {
    return url;
  }
  
  // For videos, try to generate thumbnail URL (implementation depends on video hosting)
  if (type === 'video') {
    // YouTube thumbnail
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    
    // Vimeo thumbnail would require API call, return placeholder
    if (url.includes('vimeo.com')) {
      return '/images/ui/placeholder-video.svg';
    }
  }
  
  return '/images/ui/placeholder-media.svg';
};

export const generateMediaId = (media: { url: string; title: string }): string => {
  return `${media.url}-${media.title}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
};



export const organizeMediaByCategory = (media: UnifiedMediaItem[]): MediaCollection[] => {
  const categoryGroups: Record<string, UnifiedMediaItem[]> = {};

  media.forEach(item => {
    if (!categoryGroups[item.category]) {
      categoryGroups[item.category] = [];
    }
    categoryGroups[item.category].push(item);
  });

  return Object.entries(categoryGroups).map(([category, items]) => ({
    id: `collection-${category}`,
    title: getCategoryLabel(category as MediaCategory),
    description: `${items.length} media items`,
    items: items.sort((a, b) => a.title.localeCompare(b.title)),
    category: category as MediaCategory,
    thumbnail: items[0]?.thumbnail || items[0]?.url
  }));
};

export const filterAndSortMedia = (media: UnifiedMediaItem[], filters: MediaFilters): UnifiedMediaItem[] => {
  let filtered = [...media];

  // Type filter
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(item => filters.types!.includes(item.type));
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(item => filters.categories!.includes(item.category));
  }

  // Year filter
  if (filters.year) {
    filtered = filtered.filter(item => item.year === filters.year);
  }

  // Search term filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(item =>
      item.tags?.some(tag => filters.tags!.includes(tag))
    );
  }

  // Sort
  const { sortBy = 'title', sortOrder = 'asc' } = filters;
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'year':
        comparison = (a.year || '').localeCompare(b.year || '');
        break;
      case 'created':
        comparison = String(a.metadata?.createdAt || '').localeCompare(String(b.metadata?.createdAt || ''));
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return filtered;
};
