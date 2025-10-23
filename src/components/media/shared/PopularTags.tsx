import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { useMediaTags } from '@/hooks/useMediaTags';

interface PopularTagsProps {
  onTagClick?: (tag: string) => void;
  limit?: number;
}

export const PopularTags: React.FC<PopularTagsProps> = ({
  onTagClick,
  limit = 10,
}) => {
  const { getPopularTags, isLoading } = useMediaTags();
  const popularTags = getPopularTags(limit);

  if (isLoading || popularTags.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Popular Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {popularTags.map(({ tag, count }) => (
          <Badge
            key={tag}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            onClick={() => onTagClick?.(tag)}
          >
            {tag}
            <span className="ml-1 text-xs opacity-70">({count})</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};
