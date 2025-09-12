import React from 'react';
import { Play, FileText, Image, Headphones, Video, File, User, Palette, Settings, Star } from 'lucide-react';
import type { MediaType, MediaCategory } from '@/types/media';

export const getMediaIcon = (type: MediaType, size: string = 'w-5 h-5') => {
  const props = { className: size };
  switch (type) {
    case 'video': return React.createElement(Play, props);
    case 'audio': return React.createElement(Headphones, props);
    case 'image': 
    case 'portfolio': return React.createElement(Image, props);
    case 'document': return React.createElement(FileText, props);
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