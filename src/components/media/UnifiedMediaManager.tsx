import React, { useState } from 'react';
import { MediaGrid } from '@/components/media/core/MediaGrid';
import { MediaFilterPanel } from '@/components/media/admin/MediaFilterPanel';
import { MediaUploadDialog } from '@/components/media/admin/MediaUploadDialog';
import { MediaLinkManager } from '@/components/media/admin/MediaLinkManager';
import { useUnifiedMedia } from '@/hooks/useUnifiedMedia';
import { useLinkMedia } from '@/hooks/useLinkMedia';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
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
  List
} from 'lucide-react';
import type { UnifiedMediaItem, MediaFilters } from '@/types/unified-media';
import type { MediaLibraryItem } from '@/types/mediaLibrary';
import { uploadMultipleToMediaLibrary } from '@/utils/mediaUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UnifiedMediaManagerProps {
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

export const UnifiedMediaManager: React.FC<UnifiedMediaManagerProps> = ({
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

  // Build filter based on entity type
  const baseFilters: MediaFilters = entityType === 'global'
    ? {} as MediaFilters
    : {
        [`${entityType}_id`]: entityId,
        ...(mode === 'public' && { status: 'approved' }),
      } as MediaFilters;

  const [filters, setFilters] = useState<MediaFilters>(baseFilters);

  // Fetch media dynamically
  const { media, isLoading, stats } = useUnifiedMedia(filters);

  const { 
    linkToProject, 
    linkToParticipant, 
    linkToSponsor,
    unlinkFromProject,
    unlinkFromParticipant,
    unlinkFromSponsor,
  } = useLinkMedia();

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

  // Convert to UnifiedMediaItem format
  const unifiedMedia: UnifiedMediaItem[] = media.map(item => ({
    id: item.id,
    type: item.type as UnifiedMediaItem['type'],
    url: item.public_url,
    title: item.title,
    description: item.description,
    thumbnail: item.thumbnail_url,
    category: item.category as any,
  }));

  // Filter by tab
  const tabFilteredMedia = unifiedMedia.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'images') return item.type === 'image';
    if (activeTab === 'videos') return item.type === 'video';
    if (activeTab === 'audio') return item.type === 'audio';
    if (activeTab === 'documents') return item.type === 'document';
    return true;
  });

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
                media={tabFilteredMedia.map(item => ({
                  ...item,
                  type: item.type as 'image' | 'video' | 'audio' | 'document',
                  isLegacy: (media.find(m => m.id === item.id) as MediaLibraryItem)?.is_legacy
                }))}
                viewMode={viewMode}
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
    </div>
  );
};
