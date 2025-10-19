import React from 'react';
import { MediaGrid } from '../core/MediaGrid';

interface PublicMediaGalleryProps {
  media: any[];
  loading?: boolean;
  emptyMessage?: string;
}

export const PublicMediaGallery: React.FC<PublicMediaGalleryProps> = ({
  media,
  loading = false,
  emptyMessage = 'Inga mediafiler tillgängliga.',
}) => {
  const handlePlay = (item: any) => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <MediaGrid
      media={media}
      loading={loading}
      emptyMessage={emptyMessage}
      onPlay={handlePlay}
    />
  );
};
