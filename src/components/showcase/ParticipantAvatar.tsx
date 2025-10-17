import React from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { cn } from '@/lib/utils';

interface ParticipantAvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32'
};

export const ParticipantAvatar: React.FC<ParticipantAvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  priority = false
}) => {
  return (
    <div className={cn('relative rounded-full overflow-hidden', sizeClasses[size], className)}>
      <OptimizedImage
        src={src}
        alt={`${name}'s avatar`}
        fallbackSrc="/images/participants/placeholder-avatar.svg"
        priority={priority}
        thumbnail
        objectFit="cover"
        className="w-full h-full"
      />
    </div>
  );
};
