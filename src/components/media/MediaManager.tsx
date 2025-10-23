import React, { useState } from 'react';
import {
  MediaGrid,
  MediaLightbox,
  MediaFilterPanel,
  MediaUploadDialog,
  MediaLinkManager
} from '@/components/media';
import { useMediaLibrary } from '@/hooks/media/useMediaLibrary';
import { useLinkMedia } from '@/hooks/useLinkMedia';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useMediaPlayer } from '@/contexts/MediaContext';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Link as LinkIcon,
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Camera,
  Grid as GridIcon,
  List,
  PlayCircle,
  ListMusic,
  Download
} from 'lucide-react';
import type { MediaItem, MediaFilters } from '@/types/unified-media';
import type { MediaLibraryItem } from '@/types/mediaLibrary';
import { uploadMultipleToMediaLibrary } from '@/utils/media';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MediaManagerProps {
  entityType: 'project' | 'participant' | 'sponsor' | 'global';
  entityId?: string;
  entityName?: string;
  mode: 'admin' | 'public';
  showUpload?: boolean;
  showLinking?: boolean;
  showFilters?: boolean;
}

const getMediaIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'image': return <ImageIcon className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'audio': return <Music className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

export const MediaManager: React.FC<MediaManagerProps> = ({
  entityType,
  entityId,
  entityName,
  mode,
  showUpload = mode === 'admin',
  showLinking = mode === 'admin',
  showFilters = mode === 'admin',
}) => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLinkManager, setShowLinkManager] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'audio' | 'documents'>('all');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<MediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Build filter based on entity type - REMOVE approved filter for public mode
  // This allows ALL media to show in project showcases for testing
  const baseFilters: MediaFilters = entityType === 'global'
    ? {} as MediaFilters
    : {
        [`${entityType}_id`]: entityId,
        // Remove status: 'approved' filter to show all media for now
        // ...(mode === 'public' && { status: 'approved' }),
      } as MediaFilters;

  const [filters, setFilters] = useState<MediaFilters>(baseFilters);

  // Debug logging for MediaManager
  console.log('🎯 MediaManager Debug:', {
    entityType,
    entityId,
    mode,
    filters,
    baseFilters
  });

  // Fetch media dynamically
  const { media, isLoading, stats } = useMediaLibrary(filters);

  // Additional debug logging
  console.log('🎯 MediaManager Media Result:', {
    count: media?.length,
    stats,
    isLoading
  });

  const { 
    linkToProject, 
    linkToParticipant, 
    linkToSponsor,
    unlinkFromProject,
    unlinkFromParticipant,
    unlinkFromSponsor,
  } = useLinkMedia();

  // Media player integration
  const { playMedia, addToQueue, clearQueue } = useMediaPlayer();

  // Handle media linking
  const handleLink = async (targetEntityType: 'project' | 'participant' | 'sponsor', entityIds: string[]) => {
    if (selectedMediaIds.length === 0) return;

    try {
      switch (targetEntityType) {
        case 'project':
          await linkToProject({ mediaIds: selectedMediaIds, projectIds: entityIds });
          break;
        case 'participant':
          await linkToParticipant({ mediaIds: selectedMediaIds, participantIds: entityIds });
          break;
        case 'sponsor':
          await linkToSponsor({ mediaIds: selectedMediaIds, sponsorIds: entityIds });
          break;
      }
      setSelectedMediaIds([]);
      setShowLinkManager(false);
    } catch (error) {
      console.error('Failed to link media:', error);
    }
  };

  // Handle media selection
  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMediaIds(prev =>
      prev.includes(mediaId) ? prev.filter(id => id !== mediaId) : [...prev, mediaId]
    );
  };

  // Handler for MediaGrid selection change
  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedMediaIds(prev =>
      selected
        ? [...prev, id]
        : prev.filter(mediaId => mediaId !== id)
    );
  };

  // Handle bulk download
  const handleBulkDownload = async (mediaIds: string[]) => {
    if (mediaIds.length === 0) return;

    const selectedMedia = media.filter(m => mediaIds.includes(m.id));

    try {
      for (let i = 0; i < selectedMedia.length; i++) {
        const item = selectedMedia[i];

        const link = document.createElement('a');
        const fileExtension = item.public_url.split('.').pop()?.split('?')[0] || 'file';
        const cleanTitle = item.title.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '_').substring(0, 50);
        const filename = `${cleanTitle}_${item.id}.${fileExtension}`;

        link.href = item.public_url;
        link.download = decodeURIComponent(filename);
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show progress
        if (selectedMedia.length > 1 && i < selectedMedia.length - 1) {
          toast({
            title: `Nedladdning ${i + 1}/${selectedMedia.length}`,
            description: `Laddar ner: ${item.title}`,
          });
        }

        // Delay between downloads to avoid browser restrictions
        if (i < selectedMedia.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Clear selection and show completion
      setSelectedMediaIds([]);
      toast({
        title: 'Nedladdning klar',
        description: `Nedladdade ${selectedMedia.length} fil(er) framgångsrikt`,
      });
    } catch (error) {
      console.error('Bulk download failed:', error);
      toast({
        title: 'Nedladdning misslyckades',
        description: error instanceof Error ? error.message : 'Ett fel uppstod',
        variant: 'destructive',
      });
    }
  };

  const selectAll = () => {
    setSelectedMediaIds(media.map(m => m.id));
  };

  const clearSelection = () => {
    setSelectedMediaIds([]);
  };

  // Handle upload with auto-linking
  const handleUpload = async (files: any[]) => {
    try {
      const uploadOptions: any = {
        autoApprove: true,
      };

      // Add entity ID to upload options
      if (entityType === 'project' && entityId) {
        uploadOptions.projectId = entityId;
      } else if (entityType === 'participant' && entityId) {
        uploadOptions.participantId = entityId;
      }

      // Upload files
      const { success, failed } = await uploadMultipleToMediaLibrary(
        files.map(f => f.file),
        uploadOptions
      );

      // Create links in link tables
      if (success.length > 0 && entityType !== 'global' && entityId) {
        const linkData = success.map(media => ({
          media_id: media.id,
          [`${entityType}_id`]: entityId,
        }));

        let linkError = null;
        if (entityType === 'project') {
          const { error } = await supabase.from('media_project_links').upsert(linkData as any);
          linkError = error;
        } else if (entityType === 'participant') {
          const { error } = await supabase.from('media_participant_links').upsert(linkData as any);
          linkError = error;
        } else if (entityType === 'sponsor') {
          const { error } = await supabase.from('media_sponsor_links').upsert(linkData as any);
          linkError = error;
        }

        if (linkError) {
          console.error('Failed to create links:', linkError);
        }
      }

      // Refetch media
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });

      // Show success message
      toast({
        title: 'Uppladdning klar',
        description: `${success.length} fil(er) uppladdade${failed.length > 0 ? `, ${failed.length} misslyckades` : ''}`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Uppladdning misslyckades',
        description: error instanceof Error ? error.message : 'Ett fel uppstod',
        variant: 'destructive',
      });
    }
  };

  // Transformation Layer: Enrich MediaLibraryItem with properties MediaCard expects
  const enrichedMedia = media.map(item => ({
    ...item,
    // Add expected properties for MediaCard component compatibility
    url: item.public_url,           // MediaCard expects 'url', database has 'public_url'
    thumbnail: item.thumbnail_url,  // Keep consistently named
    // Add minimal link arrays (components can handle empty arrays)
    media_project_links: [],
    media_participant_links: [],
  }));

  // Convert to MediaItem format for lightbox/player compatibility
  const Media: MediaItem[] = enrichedMedia.map(item => ({
    id: item.id,
    type: item.type as MediaItem['type'],
    url: item.url,
    title: item.title,
    description: item.description,
    thumbnail: item.thumbnail,
    category: item.category as any,
  }));

  // Filter by tab
  const tabFilteredMedia = Media.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'images') return item.type === 'image';
    if (activeTab === 'videos') return item.type === 'video';
    if (activeTab === 'audio') return item.type === 'audio';
    if (activeTab === 'documents') return item.type === 'document';
    return true;
  });

  // Handle lightbox open
  const handleLightboxOpen = (mediaItem: MediaItem, allMedia: MediaItem[] = tabFilteredMedia) => {
    const index = allMedia.findIndex(m => m.id === mediaItem.id);
    if (index !== -1) {
      setLightboxMedia(allMedia);
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Laddar media...</p>
        </CardContent>
      </Card>
    );
  }

  const entityLabel = entityType === 'global' 
    ? 'det globala galleriet' 
    : entityType === 'project' 
    ? 'projektet' 
    : entityType === 'participant' 
    ? 'deltagaren' 
    : 'sponsorn';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Media för {entityName || entityLabel}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">
              <Camera className="h-3 w-3 mr-1" />
              {stats.total} totalt
            </Badge>
            {mode === 'admin' && (
              <>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {stats.image} bilder
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {stats.video} videos
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {stats.audio} ljud
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Admin Controls */}
        {mode === 'admin' && isAdmin && (
          <div className="flex items-center gap-2">
            {selectedMediaIds.length > 0 && (
              <>
                <Badge variant="secondary">{selectedMediaIds.length} valda</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkDownload(selectedMediaIds)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ladda ner ({selectedMediaIds.length})
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Rensa
                </Button>
              </>
            )}
            {showUpload && (
              <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Ladda upp
              </Button>
            )}
            {showLinking && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLinkManager(true)}
                disabled={selectedMediaIds.length === 0}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Länka ({selectedMediaIds.length})
              </Button>
            )}
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <GridIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filters (Admin only) */}
      {showFilters && mode === 'admin' && (
        <MediaFilterPanel
          filters={filters}
          onChange={setFilters}
        />
      )}

      {/* Type Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Alla ({stats.total})</TabsTrigger>
          <TabsTrigger value="images">Bilder ({stats.image})</TabsTrigger>
          <TabsTrigger value="videos">Videos ({stats.video})</TabsTrigger>
          <TabsTrigger value="audio">Ljud ({stats.audio})</TabsTrigger>
          <TabsTrigger value="documents">Dokument ({stats.document})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {tabFilteredMedia.length > 0 ? (
            <div className="space-y-4">
              {/* Playback Controls */}
              {(() => {
                const playableMedia = tabFilteredMedia.filter(item => 
                  item.type === 'video' || item.type === 'audio'
                );
                
                if (playableMedia.length > 0) {
                  const handlePlayAll = () => {
                    const mediaItems: MediaItem[] = playableMedia.map(item => ({
                      id: item.id,
                      type: item.type as 'video' | 'audio',
                      url: item.url,
                      title: item.title,
                      description: item.description,
                      thumbnail: item.thumbnail,
                    }));
                    
                    if (mediaItems.length > 0) {
                      clearQueue();
                      addToQueue(mediaItems);
                      playMedia(mediaItems[0]);
                      toast({
                        title: 'Spellista skapad',
                        description: `${mediaItems.length} mediafil(er) tillagda i kön`,
                      });
                    }
                  };

                  const handleAddAllToQueue = () => {
                    const mediaItems: MediaItem[] = playableMedia.map(item => ({
                      id: item.id,
                      type: item.type as 'video' | 'audio',
                      url: item.url,
                      title: item.title,
                      description: item.description,
                      thumbnail: item.thumbnail,
                    }));
                    
                    addToQueue(mediaItems);
                    toast({
                      title: 'Tillagd i kö',
                      description: `${mediaItems.length} mediafil(er) tillagda`,
                    });
                  };

                  return (
                    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {playableMedia.length} mediafil(er) kan spelas
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lägg till alla i spelarkön eller starta direkt
                        </p>
                      </div>
                      <Button size="sm" onClick={handlePlayAll} className="gap-2">
                        <PlayCircle className="h-4 w-4" />
                        Spela alla
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleAddAllToQueue} className="gap-2">
                        <ListMusic className="h-4 w-4" />
                        Lägg till alla
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}

              {mode === 'admin' && selectedMediaIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={selectAll}>
                    Välj alla
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Avmarkera alla
                  </Button>
                </div>
              )}
              <MediaGrid
                items={enrichedMedia.filter(item => tabFilteredMedia.some(tf => tf.id === item.id))}
                selectedIds={new Set(selectedMediaIds)}
                onSelect={(id, selected) => handleSelectionChange(id, selected)}
    onPreview={(item) => handleLightboxOpen({
      id: item.id,
      type: item.type,
      title: item.title,
      url: item.public_url,
      description: item.description,
      thumbnail: item.thumbnail_url
    })}
                showCheckboxes={true}
                showActions={mode === 'admin'}
                context={mode === 'public' ? 'public' : 'admin'}
                onDownload={(item) => {
                  try {
                    const link = document.createElement('a');
                    const fileExtension = item.public_url.split('.').pop()?.split('?')[0] || 'file';
                    const cleanTitle = item.title.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '_').substring(0, 50);
                    const filename = `${cleanTitle}_${item.id}.${fileExtension}`;

                    link.href = item.public_url;
                    link.download = decodeURIComponent(filename);
                    link.style.display = 'none';

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (error) {
                    console.error('Download failed:', error);
                  }
                }}
              />
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-foreground mb-2">Inga filer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Det finns inga mediafiler för {entityLabel} än
                </p>
                {mode === 'admin' && isAdmin && showUpload && (
                  <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Ladda upp första filen
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <MediaUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          entityType={entityType !== 'global' ? entityType : undefined}
          entityId={entityId}
          onUpload={handleUpload}
          onUploadComplete={() => {
            setShowUploadDialog(false);
            queryClient.invalidateQueries({ queryKey: ['unified-media'] });
          }}
        />
      )}

      {/* Link Manager Dialog */}
      {showLinkManager && (
        <MediaLinkManager
          open={showLinkManager}
          onOpenChange={setShowLinkManager}
          selectedMediaIds={selectedMediaIds}
          onLink={handleLink}
        />
      )}

      {/* Lightbox */}
      <MediaLightbox
        media={lightboxMedia}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        enableNavigation={true}
      />
    </div>
  );
};
