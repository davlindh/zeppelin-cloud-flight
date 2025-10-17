import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Image, 
  Video, 
  Music, 
  FileText, 
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Archive
} from 'lucide-react';
import type { MediaLibraryItem } from '@/types/mediaLibrary';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MediaCardProps {
  item: MediaLibraryItem;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onPreview?: (item: MediaLibraryItem) => void;
  showCheckbox?: boolean;
  compact?: boolean;
}

const getMediaIcon = (type: MediaLibraryItem['type']) => {
  switch (type) {
    case 'image':
      return <Image className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'audio':
      return <Music className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: MediaLibraryItem['status']) => {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    case 'pending':
      return <Clock className="h-3 w-3 text-yellow-500" />;
    case 'rejected':
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    case 'archived':
      return <Archive className="h-3 w-3 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
};

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  selected,
  onSelect,
  onPreview,
  showCheckbox = false,
  compact = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    onPreview?.(item);
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onSelect?.(item.id);
    }
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer',
        selected && 'ring-2 ring-primary',
        compact ? 'h-32' : 'h-64'
      )}
      onClick={handleClick}
    >
      {showCheckbox && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {getStatusIcon(item.status)}
        {item.is_featured && (
          <Badge variant="secondary" className="text-xs">
            Featured
          </Badge>
        )}
      </div>

      {/* Thumbnail */}
      <div className={cn(
        'relative overflow-hidden bg-muted',
        compact ? 'h-full' : 'h-40'
      )}>
        {item.type === 'image' ? (
          <img
            src={item.thumbnail_url || item.public_url}
            alt={item.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {getMediaIcon(item.type)}
          </div>
        )}
      </div>

      {!compact && (
        <CardContent className="p-3">
          <h4 className="font-semibold text-sm truncate mb-1">{item.title}</h4>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            {getMediaIcon(item.type)}
            <span>{formatFileSize(item.file_size)}</span>
            {item.width && item.height && (
              <span>{item.width}×{item.height}</span>
            )}
            {item.duration && (
              <span>{Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}</span>
            )}
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
