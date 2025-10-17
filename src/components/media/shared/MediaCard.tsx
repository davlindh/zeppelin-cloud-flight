import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Image, Video, Music, FileText, MoreVertical, Download, Link2, Trash2, Edit, Eye } from "lucide-react";
import { MediaLibraryItem } from "@/types/mediaLibrary";
import { cn } from "@/lib/utils";

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
}

const getMediaIcon = (type: string) => {
  switch (type) {
    case 'image':
      return Image;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    default:
      return FileText;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'rejected':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function MediaCard({
  item,
  selected = false,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onLink,
  onDownload,
  showActions = true,
}: MediaCardProps) {
  const Icon = getMediaIcon(item.type);

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all hover:shadow-lg",
      selected && "ring-2 ring-primary"
    )}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(item.id, checked as boolean)}
            className="bg-background"
          />
        </div>
      )}

      {/* Actions Menu */}
      {showActions && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
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
                  Edit Metadata
                </DropdownMenuItem>
              )}
              {onLink && (
                <DropdownMenuItem onClick={() => onLink(item)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Link to Project
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
      <div 
        className="aspect-video bg-muted flex items-center justify-center cursor-pointer"
        onClick={() => onPreview?.(item)}
      >
        {item.type === 'image' && item.thumbnail_url ? (
          <img
            src={item.thumbnail_url || item.public_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : item.type === 'video' && item.thumbnail_url ? (
          <div className="relative w-full h-full">
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-12 w-12 text-white opacity-80" />
            </div>
          </div>
        ) : (
          <Icon className="h-16 w-16 text-muted-foreground" />
        )}
      </div>

      {/* Media Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm line-clamp-1" title={item.title}>
            {item.title}
          </h3>
          <Badge className={cn("text-xs", getStatusColor(item.status))}>
            {item.status}
          </Badge>
        </div>

        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(item.file_size)}</span>
          <span>{item.type}</span>
        </div>

        {item.tags && item.tags.length > 0 && (
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
      </div>
    </Card>
  );
}
