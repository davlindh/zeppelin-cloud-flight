import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Play, Download, ExternalLink, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMediaIcon, getMediaTypeColor, isPlayableMedia } from '@/utils/mediaHelpers';

interface MediaCardProps {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  className?: string;
  onPlay?: () => void;
  onAddToQueue?: () => void;
  onDownload?: () => void;
  showPlayButton?: boolean;
  showAddToQueue?: boolean;
  showDownload?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  id,
  type,
  title,
  description,
  url,
  thumbnail,
  className,
  onPlay,
  onAddToQueue,
  onDownload,
  showPlayButton = true,
  showAddToQueue = true,
  showDownload = true,
}) => {
  const isPlayable = isPlayableMedia(type);

  return (
    <Card className={cn(
      "card-enhanced border-0 shadow-soft hover:shadow-elegant transition-all duration-300 group overflow-hidden",
      className
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {title}
              </h4>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            <Badge
              variant="outline"
              className={cn("flex-shrink-0", getMediaTypeColor(type))}
            >
              {getMediaIcon(type, 'w-3 h-3')}
              <span className="ml-1 text-xs uppercase">{type}</span>
            </Badge>
          </div>

          {/* Preview */}
          {type === 'image' && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <OptimizedImage
                src={thumbnail || url}
                alt={title}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                objectFit="cover"
                aspectRatio="16/9"
              />
            </div>
          )}

          {(type === 'video' || type === 'audio') && (
            <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary ml-0.5" />
                </div>
                <p className="text-xs text-muted-foreground">Klicka för att spela</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showPlayButton && (
              <Button
                size="sm"
                onClick={onPlay}
                className="flex-1"
                variant="outline"
              >
                {getMediaIcon(type, 'w-4 h-4')}
                <span className="ml-2">
                  {isPlayable ? 'Spela' : 'Öppna'}
                </span>
              </Button>
            )}

            {showAddToQueue && isPlayable && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onAddToQueue}
                className="px-2"
                title="Lägg till i kö"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {showDownload && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDownload}
                className="px-2"
                title="Ladda ner"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
