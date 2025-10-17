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
} from "lucide-react";
import type { MediaLibraryItem } from "@/types/mediaLibrary";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "Unknown";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
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

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer",
        selected && "ring-2 ring-primary",
        compact ? "h-32" : "h-64"
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
          />
        </div>
      )}

      {/* Status & Featured Badge */}
      {showStatus && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Badge variant="outline" className={cn("text-xs", getStatusColor(item.status))}>
            {getStatusIcon(item.status)}
            <span className="ml-1 capitalize">{item.status}</span>
          </Badge>
          {item.is_featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
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

      {/* Thumbnail */}
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          compact ? "h-full" : "h-40"
        )}
      >
        {item.type === "image" ? (
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

      {/* Content */}
      {!compact && (
        <CardContent className="p-3">
          <h4 className="font-semibold text-sm truncate mb-1">{item.title}</h4>

          {showMetadata && (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                {getMediaIcon(item.type)}
                <span>{formatFileSize(item.file_size)}</span>
                {item.width && item.height && (
                  <span>
                    {item.width}×{item.height}
                  </span>
                )}
                {item.duration && (
                  <span>
                    {Math.floor(item.duration / 60)}:
                    {String(item.duration % 60).padStart(2, "0")}
                  </span>
                )}
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
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
