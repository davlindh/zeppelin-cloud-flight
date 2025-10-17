import React from 'react';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { MediaToolbar } from '@/components/media/MediaToolbar';
import { MediaGrid } from '@/components/media/shared/MediaGrid';
import { MediaPreviewPanel } from '@/components/media/MediaPreviewPanel';
import { MediaUploadDialog } from '@/components/media/MediaUploadDialog';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { MediaFilters, MediaLibraryItem } from '@/types/mediaLibrary';
import { Image, Video, Music, FileText } from 'lucide-react';

export const MediaLibraryPage: React.FC = () => {
  const [filters, setFilters] = React.useState<MediaFilters>({});
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = React.useState<MediaLibraryItem | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const { 
    media, 
    isLoading, 
    updateMedia, 
    deleteMedia,
    bulkApprove,
    bulkDelete,
  } = useMediaLibrary(filters);

  // Statistics
  const stats = React.useMemo(() => {
    return {
      total: media.length,
      images: media.filter(m => m.type === 'image').length,
      videos: media.filter(m => m.type === 'video').length,
      audio: media.filter(m => m.type === 'audio').length,
      documents: media.filter(m => m.type === 'document').length,
      pending: media.filter(m => m.status === 'pending').length,
      approved: media.filter(m => m.status === 'approved').length,
    };
  }, [media]);

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkApprove = () => {
    bulkApprove(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    bulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMedia(id);
    if (previewItem?.id === id) {
      setPreviewItem(null);
    }
  };

  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage all media files across the platform
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Image className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.images}</div>
            <div className="text-sm text-muted-foreground">Images</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Video className="h-4 w-4 text-purple-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.videos}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Music className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.audio}</div>
            <div className="text-sm text-muted-foreground">Audio</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-orange-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <div className="text-sm text-muted-foreground">Documents</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-500">P</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-green-500">✓</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </Card>
        </div>

        <Separator />

        {/* Toolbar */}
        <MediaToolbar
          filters={filters}
          onFiltersChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCount={selectedIds.size}
          onBulkApprove={handleBulkApprove}
          onBulkDelete={handleBulkDelete}
          onUpload={() => setUploadDialogOpen(true)}
        />

        {/* Media Grid */}
        <MediaGrid
          media={media}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onPreview={setPreviewItem}
          showCheckboxes
          compact={viewMode === 'list'}
          columns={viewMode === 'list' ? 2 : 4}
          loading={isLoading}
          emptyMessage="No media files found. Upload your first file to get started."
        />

        {/* Preview Panel */}
        <MediaPreviewPanel
          item={previewItem}
          open={!!previewItem}
          onOpenChange={(open) => !open && setPreviewItem(null)}
          onUpdate={(id, updates) => updateMedia({ id, updates })}
          onDelete={handleDelete}
          editable
        />

        {/* Upload Dialog */}
        <MediaUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUploadComplete={handleUploadComplete}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Media Files?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedIds.size} selected file(s)? 
                This action cannot be undone and will remove the files from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};
