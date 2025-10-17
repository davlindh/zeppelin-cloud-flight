import { MediaLibraryItem } from "@/types/mediaLibrary";
import { MediaCard } from "./MediaCard";

interface MediaGridProps {
  items: MediaLibraryItem[];
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  onPreview?: (item: MediaLibraryItem) => void;
  onEdit?: (item: MediaLibraryItem) => void;
  onDelete?: (item: MediaLibraryItem) => void;
  onLink?: (item: MediaLibraryItem) => void;
  onDownload?: (item: MediaLibraryItem) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export function MediaGrid({
  items,
  selectedIds = new Set(),
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onLink,
  onDownload,
  showActions = true,
  emptyMessage = "No media files found",
}: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <MediaCard
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
        />
      ))}
    </div>
  );
}
