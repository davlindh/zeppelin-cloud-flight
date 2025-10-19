import { MediaLibraryItem } from "@/types/mediaLibrary";
import { MediaCardAdmin } from "./MediaCardAdmin";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  media?: MediaLibraryItem[];
  items?: MediaLibraryItem[];
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onPreview?: (item: MediaLibraryItem) => void;
  onEdit?: (item: MediaLibraryItem) => void;
  onDelete?: (item: MediaLibraryItem) => void;
  onLink?: (item: MediaLibraryItem) => void;
  onDownload?: (item: MediaLibraryItem) => void;
  showActions?: boolean;
  showCheckboxes?: boolean;
  compact?: boolean;
  showMetadata?: boolean;
  showStatus?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
  loading?: boolean;
  emptyMessage?: string;
  context?: "admin" | "public";
}

export function MediaGrid({
  media,
  items,
  selectedIds = new Set(),
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onLink,
  onDownload,
  showActions = true,
  showCheckboxes = false,
  compact = false,
  showMetadata = true,
  showStatus = true,
  columns = 4,
  loading = false,
  emptyMessage = "No media files found",
  context = "admin",
}: MediaGridProps) {
  // Support both 'media' and 'items' props for backward compatibility
  const mediaItems = media || items || [];
  // Loading state
  if (loading) {
    return (
      <div
        className={cn(
          "grid gap-4",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          columns === 4 &&
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
          columns === 5 &&
            "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          columns === 6 &&
            "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        )}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse bg-muted rounded-lg",
              compact ? "h-32" : "h-64"
            )}
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (mediaItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Grid with items
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 &&
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        columns === 5 &&
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        columns === 6 &&
          "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      )}
    >
      {mediaItems.map((item) => (
        <MediaCardAdmin
          key={item.id}
          item={item}
          selected={selectedIds.has(item.id)}
          onSelect={onSelect}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
          onLink={onLink}
          onDownload={onDownload}
          showActions={showActions}
          showCheckbox={showCheckboxes}
          compact={compact}
          showMetadata={showMetadata}
          showStatus={showStatus}
          context={context}
        />
      ))}
    </div>
  );
}
