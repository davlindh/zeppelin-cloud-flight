import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  // NEW: Pass raw database data to show ALL available information
  rawData?: {
    project_media?: any[];
  };
}

export const ProjectMediaSection: React.FC<ProjectMediaSectionProps> = ({
  media,
  projectId,
  rawData
}) => {
  // Debug: Log all incoming props
  console.log('🔍 ProjectMediaSection: Received props:', {
    media,
    projectId,
    rawData,
    rawDataProjectMedia: rawData?.project_media,
    rawDataProjectMediaLength: rawData?.project_media?.length
  });

  // Prioritize raw database data for complete information display
  const fullMediaData = rawData?.project_media?.length ?
    rawData.project_media :
    media;

  console.log('🔍 ProjectMediaSection: fullMediaData:', fullMediaData);

  if (!fullMediaData || fullMediaData.length === 0) {
    console.log('🔍 ProjectMediaSection: No media data, returning null');
    return null;
  }

  // Debug log to show we're displaying complete data
  console.log('🔍 ProjectMediaSection: Displaying', fullMediaData.length, 'media items with full metadata');

  // Show ALL available data from the database
  return (
    <Card className="card-glow border-2 border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-xl">
          Projekt Media ({fullMediaData.length} items)
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Displaying complete media data from database with all available metadata
        </div>
      </CardHeader>
      <CardContent>
        <UnifiedMediaGrid
          media={fullMediaData.map((item, index): UnifiedMediaItem => ({
            id: item.id || generateMediaId(item), // Use database ID if available
            type: item.type as UnifiedMediaItem['type'],
            category: 'featured',
            url: item.url,
            title: item.title,
            description: item.description,
            projectId,
            // Add database-specific metadata to show ALL available data
            created_at: item.created_at,
            updated_at: item.updated_at,
            // Include any additional fields from raw database
            ...item // Spread all other fields to preserve complete data
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
      </CardContent>
    </Card>
  );
};
