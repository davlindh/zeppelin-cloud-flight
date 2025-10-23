import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RichMediaPreview } from './RichMediaPreview';
import { Play, Download, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMediaIcon, getMediaTypeColor, isPlayableMedia } from '@/utils/media';
import { useMediaPlayer } from '@/hooks/useMediaPlayer';
import type { MediaLibraryItem } from '@/types/mediaLibrary';

interface MediaCardProps {
  item: MediaLibraryItem;
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showCheckbox?: boolean;
  onPlay?: (item: MediaLibraryItem) => void;
  onAddToQueue?: (item: MediaLibraryItem) => void;
  onDownload?: (item: MediaLibraryItem) => void;
  onLightboxOpen?: (item: MediaLibraryItem) => void;
  showContext?: boolean;
  className?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  selected = false,
  onSelectionChange,
  showCheckbox = false,
  onPlay,
  onAddToQueue,
  onDownload,
  onLightboxOpen,
  showContext = false,
  className,
}) => {
  const isPlayable = isPlayableMedia(item.type);
  const navigate = useNavigate();
  const { playMedia, addToQueue: mediaPlayerAddToQueue } = useMediaPlayer();

  // Handle play button click
  const handlePlay = () => {
    if (onPlay) {
      onPlay(item);
    } else {
          const mediaItem = {
        id: item.id,
        type: item.type as 'video' | 'audio',
        url: item.public_url,
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail_url,
      };
      playMedia(mediaItem);
    }
  };

  // Handle add to queue
  const handleAddToQueue = () => {
    if (onAddToQueue) {
      onAddToQueue(item);
    } else if (isPlayable) {
      const mediaItem = {
        id: item.id,
        type: item.type as 'video' | 'audio',
        url: item.public_url,
        title: item.title,
        description: item.description,
        thumbnail: item.thumbnail_url,
      };
      mediaPlayerAddToQueue(mediaItem);
    }
  };

  // Handle lightbox open
  const handleLightboxOpen = () => {
    if (onLightboxOpen && (item.type === 'image' || item.type === 'video')) {
      onLightboxOpen(item);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload(item);
    } else {
      try {
        const link = document.createElement('a');
        const url = item.public_url || '';
        const fileExtension = url.split('.').pop()?.split('?')[0] || 'file';
        const cleanTitle = item.title.replace(/[^a-z0-9\-_\s]/gi, '').replace(/\s+/g, '_').substring(0, 50);
        const filename = `${cleanTitle}_${item.id}.${fileExtension}`;

        link.href = url;
        link.download = decodeURIComponent(filename);
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  // Context data (would come from joins in actual queries)
  const projectLinks: Array<{id: string, title: string, slug: string}> = [];
  const participantLinks: Array<{id: string, name: string, slug: string}> = [];

  return (
    <Card
      className={cn(
        "card-enhanced border-0 shadow-soft hover:shadow-elegant transition-all duration-300 group overflow-hidden",
        selected ? "ring-2 ring-primary shadow-lg" : "shadow-soft",
        (item.type === 'image' || item.type === 'video') && onLightboxOpen ? "cursor-pointer hover:shadow-xl" : "",
        className
      )}
      onClick={() => {
        if ((item.type === 'image' || item.type === 'video') && onLightboxOpen) {
          handleLightboxOpen();
        }
      }}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {showCheckbox && (
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => onSelectionChange?.(checked as boolean)}
                  />
                </div>
              )}
              <h4 className="font-medium text-xs text-foreground truncate group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            <div className="flex gap-1 flex-shrink-0">
              {item.status !== 'approved' && (
                <Badge variant="secondary" className="text-xs">
                  {item.status}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn("flex-shrink-0", getMediaTypeColor(item.type))}
              >
                {getMediaIcon(item.type, 'w-3 h-3')}
                <span className="ml-1 text-xs uppercase">{item.type}</span>
              </Badge>
            </div>
          </div>

          {/* Media Preview using RichMediaPreview */}
          <RichMediaPreview
            item={item}
            className="aspect-video"
          />

          {/* Context badges */}
          {showContext && (projectLinks.length > 0 || participantLinks.length > 0) && (
            <div className="flex flex-wrap gap-1">
              {projectLinks.map(link => (
                <div
                  key={link.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/showcase/${link.slug}`);
                  }}
                >
                  <Badge
                    variant="outline"
                    className="hover:bg-primary/10 transition-colors text-xs"
                  >
                    📁 {link.title}
                  </Badge>
                </div>
              ))}
              {participantLinks.map(link => (
                <div
                  key={link.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/participant/${link.slug}`);
                  }}
                >
                  <Badge
                    variant="secondary"
                    className="hover:bg-secondary/80 transition-colors text-xs"
                  >
                    👤 {link.name}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isPlayable && (
              <>
                <Button
                  size="sm"
                  onClick={handlePlay}
                  variant="outline"
                  className="flex-1 text-xs px-2"
                >
                  {getMediaIcon(item.type, 'w-3 h-3 mr-1')}
                  Spela
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddToQueue}
                  className="px-1"
                  title="Lägg till i kö"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              className="px-1"
              title="Ladda ner"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
