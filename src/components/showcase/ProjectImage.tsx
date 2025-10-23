import React from 'react';
import { Image } from '@/components/media/Image';
import { cn } from '@/lib/utils';

interface ProjectImageProps {
  src?: string | null;
  title: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
}

export const ProjectImage: React.FC<ProjectImageProps> = ({
  src,
  title,
  className,
  priority = false,
  aspectRatio = '16/9'
}) => {
  return (
    <Image
      src={src}
      alt={`${title} project image`}
      fallbackSrc="/images/projects/placeholder-project.svg"
      priority={priority}
      thumbnail
      objectFit="cover"
      // Removed aspectRatio as it's handled by the component itself
      // aspectRatio={aspectRatio}
      className={cn('rounded-lg', className)}
    />
  );
};
