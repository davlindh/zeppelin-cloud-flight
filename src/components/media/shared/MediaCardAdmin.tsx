import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image,
  Video,
  Music,
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Archive,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Link2,
  Download,
  Star,
  Play,
} from "lucide-react";
import type { MediaLibraryItem } from "@/types/mediaLibrary";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { formatFileSize, getMediaColorScheme, getStatusColorScheme, getThumbnailUrl } from "@/utils/media";

interface MediaCardProps {
  item: MediaLibraryItem;
  selected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onPreview?: (item: MediaLibraryItem) => void;
  onEdit?: (item: MediaLibraryItem) => void;
  onDelete?: (item: MediaLibraryItem) => void;
  onLink?: (item: MediaLibraryItem) => void;
  onDownload?: (item: MediaLibraryItem) => void;
  showActions?: boolean;
  showCheckbox?: boolean;
  compact?: boolean;
  showMetadata?: boolean;
  showStatus?: boolean;
  context?: "admin" | "public";
}

const getMediaIcon = (type: MediaLibraryItem["type"]) => {
  switch (type) {
    case "image":
      return <Image className="h-4 w-4" />;
    case "video":
      return <Video className="h-4 w-4" />;
    case "audio":
      return <Music className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: MediaLibraryItem["status"]) => {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    case "pending":
      return <Clock className="h-3 w-3 text-yellow-500" />;
    case "rejected":
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    case "archived":
      return <Archive className="h-3 w-3 text-gray-500" />;
  }
};

const getStatusColor = (status: MediaLibraryItem["status"]) => {
  switch (status) {
    case "approved":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "rejected":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    case "archived":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
  }
};

// Helper to clean up title from UUID patterns
const cleanTitle = (title: string): string => {
  const cleaned = title.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '');
  return cleaned.replace(/^[-\s]+|[-\s]+$/g, '').trim() || title;
};

export function MediaCardAdmin({
  item,
  selected = false,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onLink,
  onDownload,
  showActions = true,
  showCheckbox = false,
  compact = false,
  showMetadata = true,
  showStatus = true,
  context = "admin",
}: MediaCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return;
    onPreview?.(item);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onSelect?.(item.id, checked as boolean);
  };

  const colorScheme = getMediaColorScheme(item.type);
  const statusScheme = getStatusColorScheme(item.status);
  const displayTitle = cleanTitle(item.title);
  
  // Smart thumbnail generation with type-specific handling
  const thumbnailUrl = React.useMemo(() => {
    if (item.type === 'image') {
      // Use thumbnail_url if available
      if (item.thumbnail_url) return item.thumbnail_url;

      // Generate thumbnail from public_url if available
      if (item.public_url) {
        return getThumbnailUrl(item.public_url, { width: 400, quality: 75 });
      }

      return '/placeholder.svg';
    } else if (item.type === 'video') {
      // Use thumbnail_url for videos, fallback to placeholder
      return item.thumbnail_url || '/placeholder.svg';
    } else if (item.type === 'audio') {
      return '/placeholder.svg'; // Audio uses overlay
    } else if (item.type === 'document') {
      return '/placeholder.svg'; // Document uses icon overlay
    }
    return item.thumbnail_url || item.public_url || '/placeholder.svg';
  }, [item]);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer border-2",
        colorScheme.border,
        selected && "ring-2 ring-primary ring-offset-2",
        compact ? "h-32" : "h-auto"
      )}
      onClick={handleClick}
    >
      {/* Checkbox */}
      {showCheckbox && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="bg-background shadow-md"
          />
        </div>
      )}

      {/* Featured Badge */}
      {item.is_featured && (
        <Badge className="absolute top-2 left-2 z-10 bg-yellow-500 text-white border-0 shadow-md">
          <Star className="h-3 w-3 mr-1 fill-white" />
          Featured
        </Badge>
      )}

      {/* Status Badge */}
      {showStatus && (
        <Badge className={cn("absolute top-2 right-12 z-10 shadow-md border", statusScheme.className)}>
          {getStatusIcon(item.status)}
          <span className="ml-1 capitalize">{item.status}</span>
        </Badge>
      )}

      {/* Actions Dropdown */}
      {showActions && context === "admin" && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onPreview && (
                <DropdownMenuItem onClick={() => onPreview(item)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onLink && (
                <DropdownMenuItem onClick={() => onLink(item)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Link
                </DropdownMenuItem>
              )}
              {onDownload && (
                <DropdownMenuItem onClick={() => onDownload(item)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Media Preview */}
      <div className={cn(
        'relative overflow-hidden',
        compact ? 'h-full' : 'h-48',
        'bg-gradient-to-br',
        colorScheme.bg
      )}>
        {item.type === 'image' && (
          <img
            src={thumbnailUrl}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        )}
        {item.type === 'video' && (
          <div className="relative w-full h-full">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={displayTitle}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Video className={cn('h-16 w-16', colorScheme.icon)} />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 transition-transform group-hover:scale-110">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
            {item.duration && (
              <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0">
                {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
              </Badge>
            )}
          </div>
        )}
        {item.type === 'audio' && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className={cn('p-6 rounded-lg', colorScheme.bg)}>
              <Music className={cn('h-16 w-16', colorScheme.icon)} />
            </div>
            {item.duration && (
              <Badge variant="secondary">
                {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
              </Badge>
            )}
          </div>
        )}
        {item.type === 'document' && (
          <div className="w-full h-full flex items-center justify-center">
            <div className={cn('p-6 rounded-lg', colorScheme.bg)}>
              <FileText className={cn('h-16 w-16', colorScheme.icon)} />
            </div>
          </div>
        )}

        {/* Type Badge */}
        <Badge className={cn(
          'absolute bottom-2 left-2 capitalize border-0 shadow-md',
          colorScheme.bg,
          colorScheme.text
        )}>
          {getMediaIcon(item.type)}
          <span className="ml-1">{item.type}</span>
        </Badge>
      </div>

      {/* Media Info */}
      {!compact && (
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold truncate" title={displayTitle}>
            {displayTitle}
          </h3>
          
          {showMetadata && (
            <>
              {/* Metadata */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium">{formatFileSize(item.file_size)}</span>
                {item.width && item.height && (
                  <span>{item.width} × {item.height}px</span>
                )}
                {item.mime_type && (
                  <span className="uppercase">{item.mime_type.split('/')[1]}</span>
                )}
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(item.created_at), "MMM d, yyyy")}</span>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
