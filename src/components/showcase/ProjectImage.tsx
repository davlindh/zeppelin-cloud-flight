import React from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
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
    <OptimizedImage
      src={src}
      alt={`${title} project image`}
      fallbackSrc="/images/projects/placeholder-project.svg"
      priority={priority}
      thumbnail
      objectFit="cover"
      aspectRatio={aspectRatio}
      className={cn('rounded-lg', className)}
    />
  );
};
