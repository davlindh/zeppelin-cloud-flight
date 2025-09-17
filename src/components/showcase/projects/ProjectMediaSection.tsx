import React from 'react';
import { Card } from '@/components/ui/card';
import { UnifiedMediaGrid } from '@/components/multimedia/UnifiedMediaGrid';
import type { UnifiedMediaItem } from '@/types/unified-media';
import { generateMediaId } from '@/utils/mediaHelpers';

interface ProjectMediaSectionProps {
  media?: Array<{
    type: string;
    url: string;
    title: string;
    description?: string;
  }>;
  projectId: string;
}

export const ProjectMediaSection: React.FC<ProjectMediaSectionProps> = ({
  media,
  projectId
}) => {
  if (!media || media.length === 0) return null;

  return (
    <Card className="card-glow reveal-up stagger-3">
      <UnifiedMediaGrid
        media={media.map((item, index): UnifiedMediaItem => ({
          id: generateMediaId(item),
          type: item.type as UnifiedMediaItem['type'],
          category: 'featured',
          url: item.url,
          title: item.title,
          description: item.description,
          projectId
        }))}
        viewMode="grid"
        showPreview
        showPlayButton
        showAddToQueue
        showDownloadButton
        showMetadata
        enableSearch
        enableFilters
      />
    </Card>
  );
};
