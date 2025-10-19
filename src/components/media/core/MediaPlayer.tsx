import React from 'react';
import { Card } from '@/components/ui/card';

interface MediaPlayerProps {
  url: string;
  type: 'video' | 'audio';
  title?: string;
  className?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  url,
  type,
  title,
  className,
}) => {
  return (
    <Card className={className}>
      <div className={type === 'video' ? 'aspect-video' : 'p-4'}>
        {type === 'video' ? (
          <video
            src={url}
            controls
            className="w-full h-full"
            controlsList="nodownload"
          />
        ) : (
          <audio src={url} controls className="w-full" controlsList="nodownload" />
        )}
      </div>
      {title && (
        <div className="p-4 border-t">
          <h3 className="font-medium">{title}</h3>
        </div>
      )}
    </Card>
  );
};
