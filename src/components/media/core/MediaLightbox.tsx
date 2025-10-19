import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { MediaPlayer } from './MediaPlayer';

interface MediaLightboxProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    type: 'image' | 'video' | 'audio' | 'document';
    title: string;
    url: string;
    description?: string;
  } | null;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  open,
  onClose,
  item,
}) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {item.type === 'image' && (
            <OptimizedImage
              src={item.url}
              alt={item.title}
              className="w-full"
              objectFit="contain"
            />
          )}

          {(item.type === 'video' || item.type === 'audio') && (
            <MediaPlayer url={item.url} type={item.type} />
          )}

          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
