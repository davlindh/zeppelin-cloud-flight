import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Eye, Trash2, FileText, Filter, SortDesc } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { MediaGallery } from '@/components/multimedia/MediaGallery';
import { FilterSystem, FilterBar, FilterResults, createSearchFilter, createMultiSelectFilter, createSingleSelectFilter, FilterConfig, useFilterSystem } from '@/components/common/FilterSystem';
import { FilterOption } from '@/components/common/FilterComponents';

interface ProjectMedia {
  id: string;
  project_id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  title: string;
  description?: string;
  created_at: string;
}

interface MediaFilterWrapperProps {
  mediaItems: EnrichedProjectMedia[];
  filterConfig: FilterConfig[];
  onDelete: (id: string) => void;
}

const MediaFilterWrapper: React.FC<MediaFilterWrapperProps> = ({
  mediaItems,
  filterConfig,
  onDelete
}) => {
  return (
    <FilterSystem
      config={filterConfig}
      data={mediaItems}
    >
      <FilterContent onDelete={onDelete} />
    </FilterSystem>
  );
};

const FilterContent: React.FC<{ onDelete: (id: string) => void }> = ({ onDelete }) => {
  const { filteredData, totalCount } = useFilterSystem();

  // Convert filtered data back to MediaGallery format
  const filteredMediaItems = filteredData.map((item: EnrichedProjectMedia) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    url: item.url,
    description: item.description,
    thumbnail: item.type === 'image' ? item.url : undefined
  }));

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <FilterBar />
      <FilterResults />

      {/* Filtered Media Content */}
      <div className="space-y-6">
        <MediaGallery media={filteredMediaItems} />
        <div className="border-t pt-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Manage Media Files ({filteredMediaItems.length} of {totalCount})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredData.map((item: EnrichedProjectMedia) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProjectMediaLibraryProps {
  projectId?: string;
  className?: string;
}

interface EnrichedProjectMedia extends ProjectMedia {
  created: string;
  size: number;
}

const getMediaType = (mimeType: string): 'image' | 'video' | 'document' | 'audio' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
};

export const ProjectMediaLibrary: React.FC<ProjectMediaLibraryProps> = ({
  projectId,
  className = ''
}) => {
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<ProjectMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaDescription, setNewMediaDescription] = useState('');

  const fileUpload = useFileUpload({
    bucketName: 'project-media',
    maxSizeMB: 50,
    allowedTypes: ['image/*', 'video/*', 'audio/*', 'application/*']
  });

  const loadProjectMedia = useCallback(async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('project_media')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const media = data.map(item => ({
        id: item.id,
        project_id: item.project_id,
        type: item.type,
        url: item.url,
        title: item.title || 'Untitled',
        description: item.description,
      } as ProjectMedia));

      setMediaItems(media);
    } catch (error) {
      toast({
        title: 'Error loading media',
        description: 'Failed to load project media.',
        variant: 'destructive'
      });
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (projectId) loadProjectMedia();
  }, [projectId, loadProjectMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId || !fileUpload) return;

    setIsUploading(true);
    try {
      const { url } = await fileUpload.uploadFile(file);

      const { data, error } = await supabase
        .from('project_media')
        .insert([{
          project_id: projectId,
          type: getMediaType(file.type),
          url,
          title: newMediaTitle || file.name,
          description: newMediaDescription
        }])
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Media uploaded successfully' });
      loadProjectMedia(); // Refresh the media list

      setNewMediaTitle('');
      setNewMediaDescription('');
      e.target.value = '';
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload media file.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_media')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Media deleted' });
      loadProjectMedia();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete media file.',
        variant: 'destructive'
      });
    }
  };

  // Filter configuration for media management
  const filterConfig: FilterConfig[] = [
    createSearchFilter('Search media files...'),
    createMultiSelectFilter('type', 'Media Type', [
      { id: 'image', label: 'Images', icon: '🖼️' },
      { id: 'video', label: 'Videos', icon: '🎥' },
      { id: 'audio', label: 'Audio', icon: '🎵' },
      { id: 'document', label: 'Documents', icon: '📄' }
    ]),
    createSingleSelectFilter('sortBy', 'Sort By', [
      { id: 'created_at-desc', label: 'Newest First' },
      { id: 'created_at-asc', label: 'Oldest First' },
      { id: 'title-asc', label: 'Title A-Z' },
      { id: 'title-desc', label: 'Title Z-A' },
      { id: 'type-asc', label: 'Type A-Z' }
    ])
  ];

  // Convert data with additional metadata for filtering
  const enrichedMediaData = mediaItems.map(item => ({
    ...item,
    // Add additional properties for better filtering
    created: new Date(item.created_at).toISOString(),
    size: 0, // Would need to be fetched or calculated
  }));

  if (!projectId) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Save the project first to manage media files.
        </CardContent>
      </Card>
    );
  }

  const uploadSection = (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          onClick={() => document.getElementById('media-upload')?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Add Media'}
        </Button>
        <input
          id="media-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="media-title">Title</Label>
          <Input
            id="media-title"
            value={newMediaTitle}
            onChange={(e) => setNewMediaTitle(e.target.value)}
            placeholder="Enter media title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="media-description">Description (Optional)</Label>
          <Input
            id="media-description"
            value={newMediaDescription}
            onChange={(e) => setNewMediaDescription(e.target.value)}
            placeholder="Brief description"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Supports: Images, Videos, Audio, Documents (Max: 50MB)
      </p>
    </div>
  );

  const mediaDisplay = mediaItems.length > 0 ? (
    <MediaFilterWrapper
      mediaItems={enrichedMediaData}
      filterConfig={filterConfig}
      onDelete={handleDeleteMedia}
    />
  ) : (
    <div className="text-center py-8 text-muted-foreground">
      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
      No media files yet. Upload some above.
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Project Media Library ({mediaItems.length} items)</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {uploadSection}
          {mediaDisplay}
        </CardContent>
      </Card>
    </div>
  );
};
