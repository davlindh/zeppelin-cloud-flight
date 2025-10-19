import React from 'react';
import { MediaGrid } from '@/components/media/core/MediaGrid';
import { useUnifiedMedia } from '@/hooks/useUnifiedMedia';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLinkMedia } from '@/hooks/useLinkMedia';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon, Unlink } from 'lucide-react';
import type { UnifiedMediaItem } from '@/types/unified-media';
import { MediaLinkManager } from '@/components/media/admin/MediaLinkManager';
import { useState } from 'react';

interface ProjectMediaDisplayProps {
  projectId: string;
  showAdminControls?: boolean;
}

export const ProjectMediaDisplay: React.FC<ProjectMediaDisplayProps> = ({
  projectId,
  showAdminControls = false
}) => {
  const { isAdmin } = useAdminAuth();
  const [showLinkManager, setShowLinkManager] = useState(false);
  
  // Fetch media dynamically based on project_id
  const { media, isLoading } = useUnifiedMedia({ 
    project_id: projectId,
    status: 'approved' // Only show approved media for public view
  });
  
  const { unlinkFromProject } = useLinkMedia();

  const handleUnlinkMedia = async (mediaId: string) => {
    try {
      await unlinkFromProject({ mediaId, projectId });
    } catch (error) {
      console.error('Failed to unlink media:', error);
    }
  };

  // Convert to UnifiedMediaItem format
  const unifiedMedia: UnifiedMediaItem[] = media.map(item => ({
    id: item.id,
    type: item.type as UnifiedMediaItem['type'],
    url: item.public_url,
    title: item.title,
    description: item.description,
    thumbnail: item.thumbnail_url,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Media</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Laddar media...
        </div>
      </div>
    );
  }

  if (unifiedMedia.length === 0 && !showAdminControls) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Media ({unifiedMedia.length})</h3>
        
        {showAdminControls && isAdmin && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowLinkManager(true)}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            Länka Media
          </Button>
        )}
      </div>

      {unifiedMedia.length > 0 ? (
        <MediaGrid
          media={unifiedMedia.map(item => ({
            ...item,
            type: item.type as 'image' | 'video' | 'audio' | 'document'
          }))}
          viewMode="grid"
          className="mt-4"
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Inga mediafiler länkade till detta projekt än.
          </p>
          {showAdminControls && isAdmin && (
            <Button variant="outline" onClick={() => setShowLinkManager(true)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Länka Media
            </Button>
          )}
        </div>
      )}

      {showLinkManager && (
        <MediaLinkManager
          open={showLinkManager}
          onOpenChange={setShowLinkManager}
          selectedMediaIds={[]}
          onLink={async (entityType, entityIds) => {
            // Media is already linked via useUnifiedMedia query
            setShowLinkManager(false);
          }}
        />
      )}
    </div>
  );
};
