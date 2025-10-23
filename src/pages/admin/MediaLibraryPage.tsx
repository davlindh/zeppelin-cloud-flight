import React from 'react';
import { useMediaLibrary } from '@/hooks/useMediaLibrary';
import {
  MediaGrid,
  MediaPreviewPanel,
  MediaUploadDialog,
  MediaFilterPanel,
  MediaBulkActionsToolbar,
  MediaViewModeToggle,
  MediaStorageStats,
  TagEditor,
  MediaLinkDialog,
  WorkflowProgress,
  WorkflowStageCard,
  ViewMode
} from '@/components/media';
import { StorageExplorer } from '@/components/media/StorageExplorer';
import type { WorkflowStage } from '@/components/media/admin/WorkflowStageCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Image, Video, Music, FileText, Upload, Filter, X, Link as LinkIcon, Clock, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '@/utils/formatFileSize';
import { format } from 'date-fns';

const MediaLibraryPage: React.FC = () => {
  const [filters, setFilters] = React.useState<MediaFilters>({});
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = React.useState<MediaLibraryItem | null>(null);
  const [showUploadDialog, setShowUploadDialog] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showTagEditor, setShowTagEditor] = React.useState(false);
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'library' | 'workflow' | 'storage'>('library');

  const { 
    media, 
    isLoading, 
    updateMedia, 
    deleteMedia,
    bulkApprove,
    bulkDelete,
    bulkTag,
    bulkLink,
    bulkChangeStatus,
    bulkDownload,
  } = useMediaLibrary(filters);

  // Statistics
  const stats = React.useMemo(() => {
    // Simplified stats - published and orphaned require separate queries for accuracy
    return {
      total: media.length,
      images: media.filter(m => m.type === 'image').length,
      videos: media.filter(m => m.type === 'video').length,
      audio: media.filter(m => m.type === 'audio').length,
      documents: media.filter(m => m.type === 'document').length,
      pending: media.filter(m => m.status === 'pending').length,
      approved: media.filter(m => m.status === 'approved').length,
      published: 0, // TODO: Requires separate query for linked media count
      orphaned: 0, // TODO: Requires separate query for unlinked old media
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

  const handleDownload = (item: MediaLibraryItem) => {
    const link = document.createElement('a');
    link.href = item.public_url;
    link.download = item.filename || item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkDownload = () => {
    bulkDownload(Array.from(selectedIds));
  };

  const handleDelete = (id: string) => {
    deleteMedia(id);
    if (previewItem?.id === id) {
      setPreviewItem(null);
    }
  };

  const handleUploadComplete = () => {
    setShowUploadDialog(false);
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

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedIds.size === 0 || e.target instanceof HTMLInputElement) return;
      
      switch(e.key.toLowerCase()) {
        case 'a':
          if (e.ctrlKey || e.metaKey) return;
          handleBulkApprove();
          break;
        case 'd':
          if (e.shiftKey) {
            handleBulkDelete();
          } else {
            handleBulkDownload();
          }
          break;
        case 't':
          setShowTagEditor(true);
          break;
        case 'l':
          setShowLinkDialog(true);
          break;
        case 'escape':
          setSelectedIds(new Set());
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedIds]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
            <p className="text-muted-foreground">
              Manage and organize all media assets
            </p>
          </div>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>

        {/* Primary Actions Header */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Media Management</h2>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setActiveTab('library')}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Global Media Library
              </Button>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload New Media
              </Button>
            </div>
          </div>

          {/* Media Type Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                <Image className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-lg font-bold">{stats.images}</div>
              <div className="text-xs text-muted-foreground">Images</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
                <Video className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-lg font-bold">{stats.videos}</div>
              <div className="text-xs text-muted-foreground">Videos</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                <Music className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-lg font-bold">{stats.audio}</div>
              <div className="text-xs text-muted-foreground">Audio</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
                <FileText className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-lg font-bold">{stats.documents}</div>
              <div className="text-xs text-muted-foreground">Documents</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-lg font-bold">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-lg font-bold">{stats.approved}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList>
            <TabsTrigger value="library">Mediabibliotek</TabsTrigger>
            <TabsTrigger value="workflow">Arbetsflöde</TabsTrigger>
            <TabsTrigger value="storage">Lagringsutforskare</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6">
            {/* Quick Stats Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-accent"
              onClick={() => setFilters({ status: 'pending' })}
            >
              {stats.pending} Väntande granskning
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-accent"
              onClick={() => setFilters({ status: 'approved' })}
            >
              {stats.approved} Godkända
            </Badge>
            <Badge 
              variant={stats.orphaned > 0 ? "destructive" : "outline"}
              className="cursor-pointer hover:opacity-80"
              onClick={() => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                setFilters({ 
                  project_id: 'none',
                  participant_id: 'none',
                  date_to: thirtyDaysAgo.toISOString()
                });
              }}
            >
              {stats.orphaned} Föräldralösa
            </Badge>
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
          <Badge variant="secondary" className="gap-2">
            {selectedIds.size} selected
            <span className="text-xs opacity-70">• D=Download Shift+D=Delete</span>
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
                    media={items.map(item => ({
                      id: item.id,
                      type: item.type as 'image' | 'video' | 'audio' | 'document',
                      title: item.title,
                      description: item.description,
                      url: item.public_url,
                      thumbnail: item.thumbnail_url
                    }))}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onPlay={(item) => setPreviewItem(item as any)}
                    onDownload={handleDownload}
                    showCheckboxes
                    columns={getViewColumns()}
                    loading={isLoading}
                  />
                </div>
              ))}
            </div>
          ) : (
            <MediaGrid
              media={media.map(item => ({
                id: item.id,
                type: item.type as 'image' | 'video' | 'audio' | 'document',
                title: item.title,
                description: item.description,
                url: item.public_url,
                thumbnail: item.thumbnail_url
              }))}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onPlay={(item) => setPreviewItem(item as any)}
              onDownload={(item) => handleDownload(item as any)}
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
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <MediaBulkActionsToolbar
            selectedCount={selectedIds.size}
            onApprove={handleBulkApprove}
            onDelete={handleBulkDelete}
            onDownload={handleBulkDownload}
            onTag={() => setShowTagEditor(true)}
            onLink={() => setShowLinkDialog(true)}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        </div>
      )}

      {/* Preview Panel */}
      <MediaPreviewPanel
        item={previewItem}
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
        onUpdate={(id, updates) => updateMedia({ id, updates })}
        onDelete={handleDelete}
        onApprove={(id) => updateMedia({ id, updates: { status: 'approved' } })}
        onReject={(id) => updateMedia({ id, updates: { status: 'rejected' } })}
        editable
      />

          </TabsContent>

          <TabsContent value="workflow" className="space-y-6">
            <WorkflowProgress stats={{
              total: stats.total,
              pending: stats.pending,
              approved: stats.approved,
              published: stats.published,
              orphaned: stats.orphaned,
            }} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <WorkflowStageCard
                stage="review"
                count={stats.pending}
                total={stats.total}
                canPromote
                onViewItems={() => {
                  setFilters({ status: 'pending' });
                  setActiveTab('library');
                }}
                onPromote={() => {
                  handleBulkApprove();
                }}
              />
              <WorkflowStageCard
                stage="approved"
                count={stats.approved}
                total={stats.total}
                canDemote
                onViewItems={() => {
                  setFilters({ status: 'approved' });
                  setActiveTab('library');
                }}
                onDemote={() => {
                  bulkChangeStatus({ ids: Array.from(selectedIds), status: 'pending' });
                  setSelectedIds(new Set());
                }}
              />
              <WorkflowStageCard
                stage="published"
                count={stats.published}
                total={stats.total}
                onViewItems={() => {
                  setFilters({ project_id: 'any' });
                  setActiveTab('library');
                }}
              />
              <WorkflowStageCard
                stage="orphaned"
                count={stats.orphaned}
                total={stats.total}
                onViewItems={() => {
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  setFilters({
                    project_id: 'none',
                    participant_id: 'none',
                    date_to: thirtyDaysAgo.toISOString()
                  });
                  setActiveTab('library');
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="storage">
            <StorageExplorer />
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <MediaUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
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

      {/* Tag Editor Dialog */}
      <TagEditor
        items={media.filter(m => selectedIds.has(m.id))}
        open={showTagEditor}
        onOpenChange={setShowTagEditor}
        onSave={(tags) => bulkTag({ ids: Array.from(selectedIds), tags })}
      />

      {/* Link Dialog */}
      <MediaLinkDialog
        mediaIds={Array.from(selectedIds)}
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onLink={(entityType, entityId) => bulkLink({ mediaIds: Array.from(selectedIds), entityType, entityId })}
      />
    </div>
  );
};

export default MediaLibraryPage;
