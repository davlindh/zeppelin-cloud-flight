import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EnhancedImage } from '@/components/multimedia/EnhancedImage';
import type { UnifiedMediaItem } from '@/types/unified-media';
import { generateMediaId } from '@/utils/mediaHelpers';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Play, 
  Download, 
  ExternalLink,
  Image as ImageIcon,
  Video,
  FileText,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectMediaSectionProps {
  media?: Array<{
    type: string;
    url: string;
    title: string;
    description?: string;
  }>;
  projectId: string;
  rawData?: {
    project_media?: any[];
  };
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

export const ProjectMediaSection: React.FC<ProjectMediaSectionProps> = ({
  media,
  projectId,
  rawData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Get media data
  const fullMediaData = rawData?.project_media?.length ? rawData.project_media : media;

  if (!fullMediaData || fullMediaData.length === 0) {
    return null;
  }

  // Filter media based on search and type
  const filteredMedia = fullMediaData.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Get unique media types for filtering
  const mediaTypes = Array.from(new Set(fullMediaData.map(item => item.type)));

  const handleMediaAction = (item: any) => {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-foreground">
            Projektmedia
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {fullMediaData.length} {fullMediaData.length === 1 ? 'fil' : 'filer'} tillgängliga
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid className="w-4 h-4" />
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

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item, index) => (
            <Card key={item.id || index} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60">
                {item.type === 'image' ? (
                  <EnhancedImage
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          {filteredMedia.map((item, index) => (
            <Card key={item.id || index} className="hover:shadow-md transition-all duration-200 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Preview Thumbnail */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {item.type === 'image' ? (
                      <EnhancedImage
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
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
      )}

      {/* Empty State */}
      {filteredMedia.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium text-foreground mb-2">Inga filer hittades</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedType !== 'all' 
                ? 'Prova att ändra dina sökkriterier eller filter' 
                : 'Det finns inga mediafiler för detta projekt än'}
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
};
