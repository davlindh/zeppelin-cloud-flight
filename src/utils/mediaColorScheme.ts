import type { MediaType } from '@/types/mediaLibrary';

/**
 * Color schemes for different media types
 */
export const mediaColorSchemes = {
  image: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    icon: 'text-blue-600',
  },
  video: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    icon: 'text-purple-600',
  },
  audio: {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    icon: 'text-green-600',
  },
  document: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/10',
    text: 'text-orange-500',
    icon: 'text-orange-600',
  },
} as const;

export function getMediaColorScheme(type: MediaType) {
  return mediaColorSchemes[type];
}

/**
 * Status color schemes
 */
export const statusColorSchemes = {
  pending: {
    variant: 'secondary' as const,
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  approved: {
    variant: 'default' as const,
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  rejected: {
    variant: 'destructive' as const,
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  archived: {
    variant: 'outline' as const,
    className: 'bg-muted text-muted-foreground',
  },
} as const;

export function getStatusColorScheme(status: string) {
  return statusColorSchemes[status as keyof typeof statusColorSchemes] || statusColorSchemes.pending;
}
