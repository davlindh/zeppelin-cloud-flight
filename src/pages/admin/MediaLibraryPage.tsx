import React from 'react';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import { MediaGrid } from '@/components/media/shared/MediaGrid';
import { MediaPreviewPanel } from '@/components/media/MediaPreviewPanel';
import { MediaUploadDialog } from '@/components/media/MediaUploadDialog';
import { MediaFilterPanel } from '@/components/media/MediaFilterPanel';
import { MediaBulkActionsToolbar } from '@/components/media/MediaBulkActionsToolbar';
import { MediaViewModeToggle, ViewMode } from '@/components/media/MediaViewModeToggle';
import { MediaStorageStats } from '@/components/media/MediaStorageStats';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { Image, Video, Music, FileText, Upload, Filter, X } from 'lucide-react';
import { formatFileSize } from '@/utils/formatFileSize';
import { format } from 'date-fns';

export const MediaLibraryPage: React.FC = () => {
  const [filters, setFilters] = React.useState<MediaFilters>({});
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = React.useState<MediaLibraryItem | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

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
      totalSize: media.reduce((sum, item) => sum + (item.file_size || 0), 0),
    };
  }, [media]);

  // Grouped media for timeline view
  const groupedByDate = React.useMemo(() => {
    if (viewMode !== 'timeline') return {};
    
    return media.reduce((acc, item) => {
      const date = format(new Date(item.created_at), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {} as Record<string, MediaLibraryItem[]>);
  }, [media, viewMode]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value || undefined }));
  };

  const getViewColumns = () => {
    switch (viewMode) {
      case 'grid':
        return 4;
      case 'list':
        return 2;
      case 'gallery':
        return 3;
      case 'timeline':
        return 4;
      default:
        return 4;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage all media files across the platform
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Quick Stats */}
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
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search media..."
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? <X className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2" />}
          Filters
          {Object.keys(filters).length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>

        <MediaViewModeToggle value={viewMode} onChange={setViewMode} />

        {selectedIds.size > 0 && (
          <Badge variant="secondary">
            {selectedIds.size} selected
          </Badge>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <MediaFilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Media Grid */}
        <div className="lg:col-span-3">
          {viewMode === 'timeline' ? (
            <div className="space-y-8">
              {Object.entries(groupedByDate).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-lg font-semibold mb-4">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </h3>
                  <MediaGrid
                    media={items}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onPreview={setPreviewItem}
                    showCheckboxes
                    columns={getViewColumns()}
                    loading={isLoading}
                  />
                </div>
              ))}
            </div>
          ) : (
            <MediaGrid
              media={media}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onPreview={setPreviewItem}
              showCheckboxes
              compact={viewMode === 'list'}
              columns={getViewColumns()}
              loading={isLoading}
              emptyMessage="No media files found. Upload your first file to get started."
            />
          )}
        </div>

        {/* Storage Stats Sidebar */}
        <div className="lg:col-span-1">
          <MediaStorageStats media={media} />
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <MediaBulkActionsToolbar
        selectedCount={selectedIds.size}
        onApprove={handleBulkApprove}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedIds(new Set())}
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
