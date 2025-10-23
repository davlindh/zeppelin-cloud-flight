import React, { useState } from 'react';
import { User, Link as LinkIcon } from 'lucide-react';
import { MediaGrid } from '@/components/media/core/MediaGrid';
import { useMedia } from '@/hooks/useMedia';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLinkMedia } from '@/hooks/useLinkMedia';
import { Button } from '@/components/ui/button';
import { getCategoryIcon, getCategoryColor, getCategoryLabel } from '@/utils/mediaHelpers';
import type { MediaCategory, MediaItem } from '@/types/unified-media';
import { MediaLinkManager } from '@/components/media/admin/MediaLinkManager';

interface ParticipantMediaProps {
  participantId: string;
  participantName?: string;
  showAdminControls?: boolean;
}

export const ParticipantMedia: React.FC<ParticipantMediaProps> = ({
  participantId,
  participantName = "Deltagare",
  showAdminControls = false
}) => {
  const { isAdmin } = useAdminAuth();
  const [showLinkManager, setShowLinkManager] = useState(false);
  
  // Fetch media dynamically based on participant_id
  const { media, isLoading } = useMedia({ 
    participant_id: participantId,
    status: 'approved' // Only show approved media for public view
  });
  
  const { unlinkFromParticipant, linkToProject, linkToParticipant, linkToSponsor } = useLinkMedia();

  const handleUnlinkMedia = async (mediaId: string) => {
    try {
      await unlinkFromParticipant({ mediaId, participantId });
    } catch (error) {
      console.error('Failed to unlink media:', error);
    }
  };

  // Convert to MediaItem format
  const mediaItems: MediaItem[] = media.map(item => ({
    id: item.id,
    type: item.type as MediaItem['type'],
    url: item.public_url,
    title: item.title,
    description: item.description,
    category: item.category as MediaCategory,
    thumbnail: item.thumbnail_url,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            {participantName}s Portfolio & Media
          </h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Laddar media...
        </div>
      </div>
    );
  }
  
  if (mediaItems.length === 0 && !showAdminControls) {
    return null;
  }

  // Group by category for better organization
  const groupedMedia = mediaItems.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, MediaItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            {participantName}s Portfolio & Media
          </h3>
        </div>
        
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
      
      <div className="text-sm text-muted-foreground">
        Visar {mediaItems.length} objekt
      </div>
      
      {mediaItems.length > 0 ? (
        <>
          {/* Grouped Media by Category */}
          {Object.entries(groupedMedia).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(category as MediaCategory, 'w-4 h-4')}
                <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getCategoryColor(category as MediaCategory)}`}>
                  {getCategoryLabel(category as MediaCategory)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'objekt' : 'objekt'}
                </span>
              </div>
              
              <MediaGrid
                media={items.map(item => ({
                  ...item,
                  type: item.type as 'image' | 'video' | 'audio' | 'document'
                }))}
                viewMode="grid"
              />
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Inga mediafiler länkade till denna deltagare än.
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
            try {
              if (entityType === 'project') {
                await linkToProject({ mediaIds: [], projectIds: entityIds });
              } else if (entityType === 'participant') {
                await linkToParticipant({ mediaIds: [], participantIds: entityIds });
              } else if (entityType === 'sponsor') {
                await linkToSponsor({ mediaIds: [], sponsorIds: entityIds });
              }
              setShowLinkManager(false);
            } catch (error) {
              console.error('Failed to link media:', error);
            }
          }}
        />
      )}
    </div>
  );
};
