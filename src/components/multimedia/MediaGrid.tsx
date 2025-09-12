import React from 'react';
import { useMediaPlayer } from '@/contexts/MediaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Image, 
  FileText, 
  Download, 
  ExternalLink,
  Plus 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types/media';

interface MediaGridProps {
  media: MediaItem[];
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ 
  media, 
  viewMode = 'grid',
  className 
}) => {
  const { playMedia, addToQueue, currentMedia } = useMediaPlayer();

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'audio':
        return <Play className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'audio':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'image':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'document':
        return 'bg-green-500/10 text-green-600 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const isPlayableMedia = (type: string) => {
    return ['video', 'audio'].includes(type);
  };

  const handleMediaAction = (mediaItem: MediaItem) => {
    if (isPlayableMedia(mediaItem.type)) {
      playMedia(mediaItem);
    } else {
      // For non-playable media, open in new tab
      window.open(mediaItem.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!media || media.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Inga mediafiler tillgängliga</p>
      </div>
    );
  }

  return (
    <div className={cn(
      viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-3",
      className
    )}>
      {media.map((item, index) => (
        <Card 
          key={index}
          className="card-enhanced border-0 shadow-soft hover:shadow-elegant transition-all duration-300 group overflow-hidden"
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                
                <Badge 
                  variant="outline"
                  className={cn("flex-shrink-0", getMediaTypeColor(item.type))}
                >
                  {getMediaIcon(item.type)}
                  <span className="ml-1 text-xs uppercase">{item.type}</span>
                </Badge>
              </div>

              {/* Media Preview */}
              {item.type === 'image' && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/public/images/ui/placeholder-project.jpg';
                    }}
                  />
                </div>
              )}

              {(item.type === 'video' || item.type === 'audio') && (
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary ml-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground">Klicka för att spela</p>
                  </div>
                </div>
              )}

              {item.type === 'document' && (
                <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Dokument</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleMediaAction(item)}
                  className="flex-1"
                  variant={currentMedia?.title === item.title ? "default" : "outline"}
                >
                  {getMediaIcon(item.type)}
                  <span className="ml-2">
                    {isPlayableMedia(item.type) ? 'Spela' : 'Öppna'}
                  </span>
                </Button>

                {isPlayableMedia(item.type) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addToQueue(item)}
                    className="px-2"
                    title="Lägg till i kö"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="px-2"
                  title="Ladda ner"
                >
                  <a
                    href={item.url}
                    download={item.title}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              {/* Additional Info */}
              {('year' in item) && item.year && (
                <div className="text-xs text-muted-foreground">
                  År: {item.year}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};