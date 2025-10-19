import React, { useState } from 'react';
import { MediaGrid } from '@/components/media/core/MediaGrid';
import { useUnifiedMedia } from '@/hooks/useUnifiedMedia';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLinkMedia } from '@/hooks/useLinkMedia';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Link as LinkIcon, 
  Search, 
  Filter, 
  Grid as GridIcon, 
  List, 
  Play, 
  Download, 
  ExternalLink,
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Camera
} from 'lucide-react';
import type { UnifiedMediaItem } from '@/types/unified-media';
import { MediaLinkManager } from '@/components/media/admin/MediaLinkManager';
import { cn } from '@/lib/utils';

interface ProjectMediaDisplayProps {
  projectId: string;
  showAdminControls?: boolean;
}

const getMediaIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'image': return <ImageIcon className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'audio': return <Music className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getMediaTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'image': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'video': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'audio': return 'bg-green-50 text-green-700 border-green-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const ProjectMediaDisplay: React.FC<ProjectMediaDisplayProps> = ({
  projectId,
  showAdminControls = false
}) => {
  const { isAdmin } = useAdminAuth();
  const [showLinkManager, setShowLinkManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');
  
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

  // Calculate media stats
  const mediaStats = {
    images: unifiedMedia.filter(m => m.type === 'image').length,
    videos: unifiedMedia.filter(m => m.type === 'video').length,
    audio: unifiedMedia.filter(m => m.type === 'audio').length,
    documents: unifiedMedia.filter(m => m.type === 'document').length
  };

  // Filter media based on search and type
  const filteredMedia = unifiedMedia.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Get unique media types for filtering
  const mediaTypes = Array.from(new Set(unifiedMedia.map(item => item.type)));

  const handleMediaAction = (item: UnifiedMediaItem) => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-serif text-foreground">Projektmedia</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Laddar media...
        </div>
      </section>
    );
  }

  if (unifiedMedia.length === 0 && !showAdminControls) {
    return null;
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-foreground">
            Projektmedia
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {mediaStats.images > 0 && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                <Camera className="h-3 w-3 mr-1" />
                {mediaStats.images} {mediaStats.images === 1 ? 'bild' : 'bilder'}
              </Badge>
            )}
            {mediaStats.videos > 0 && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                <Video className="h-3 w-3 mr-1" />
                {mediaStats.videos} {mediaStats.videos === 1 ? 'video' : 'videos'}
              </Badge>
            )}
            {mediaStats.audio > 0 && (
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <Music className="h-3 w-3 mr-1" />
                {mediaStats.audio} {mediaStats.audio === 1 ? 'ljudfil' : 'ljudfiler'}
              </Badge>
            )}
            {mediaStats.documents > 0 && (
              <Badge className="bg-gray-50 text-gray-700 border-gray-200">
                <FileText className="h-3 w-3 mr-1" />
                {mediaStats.documents} {mediaStats.documents === 1 ? 'dokument' : 'dokument'}
              </Badge>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
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
      </div>

      {/* Search and Filters */}
      {unifiedMedia.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Sök efter filnamn eller beskrivning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Alla
            </Button>
            {mediaTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="flex items-center gap-2 capitalize"
              >
                {getMediaIcon(type)}
                {type}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Media Grid/List */}
      {filteredMedia.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedia.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60">
                  {item.type === 'image' ? (
                    <OptimizedImage
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      objectFit="cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          {item.type === 'video' ? (
                            <Play className="w-6 h-6 text-primary ml-0.5" />
                          ) : (
                            getMediaIcon(item.type)
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.type === 'video' ? 'Klicka för att spela' : 'Klicka för att öppna'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleMediaAction(item)}
                        className="bg-white/90 text-gray-900 hover:bg-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Öppna
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="bg-white/90 border-white/20 hover:bg-white"
                      >
                        <a href={item.url} download={item.title} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={cn("flex-shrink-0 text-xs", getMediaTypeColor(item.type))}>
                      {getMediaIcon(item.type)}
                      <span className="ml-1 capitalize">{item.type}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMedia.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-all duration-200 border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Preview Thumbnail */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {item.type === 'image' ? (
                        <OptimizedImage
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getMediaIcon(item.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className={cn("flex-shrink-0 text-xs", getMediaTypeColor(item.type))}>
                          {getMediaIcon(item.type)}
                          <span className="ml-1 capitalize">{item.type}</span>
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMediaAction(item)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Öppna
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                      >
                        <a href={item.url} download={item.title} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium text-foreground mb-2">Inga filer hittades</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedType !== 'all' 
                ? 'Prova att ändra dina sökkriterier eller filter' 
                : unifiedMedia.length === 0 
                  ? 'Det finns inga mediafiler för detta projekt än'
                  : 'Inga matchande mediafiler'}
            </p>
            {unifiedMedia.length === 0 && showAdminControls && isAdmin && (
              <Button variant="outline" onClick={() => setShowLinkManager(true)} className="mt-4">
                <LinkIcon className="h-4 w-4 mr-2" />
                Länka Media
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {showLinkManager && (
        <MediaLinkManager
          open={showLinkManager}
          onOpenChange={setShowLinkManager}
          selectedMediaIds={[]}
          onLink={async (entityType, entityIds) => {
            setShowLinkManager(false);
          }}
        />
      )}
    </section>
  );
};
