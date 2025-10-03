import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  Grid, 
  List,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Upload,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EnhancedSubmission } from './submission-inbox/hooks/useSubmissionData';
import { getMediaIcon, getMediaTypeColor, formatFileSize } from '@/utils/mediaHelpers';

interface SubmissionFile {
  name: string;
  url: string;
  type: string;
  size?: number;
  thumbnail?: string;
}

interface SubmissionMediaItem {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size?: number;
  mimeType: string;
  thumbnail?: string;
  submission: EnhancedSubmission;
  file: SubmissionFile;
  approved?: boolean;
  convertedToMedia?: boolean;
}

interface SubmissionMediaManagerProps {
  submissions: EnhancedSubmission[];
  onApproveMedia: (mediaItem: SubmissionMediaItem) => Promise<void>;
  onRejectMedia: (mediaItem: SubmissionMediaItem) => Promise<void>;
  onConvertToMediaLibrary: (mediaItems: SubmissionMediaItem[]) => Promise<void>;
  className?: string;
}

export const SubmissionMediaManager: React.FC<SubmissionMediaManagerProps> = ({
  submissions,
  onApproveMedia,
  onRejectMedia,
  onConvertToMediaLibrary,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<SubmissionMediaItem | null>(null);

  // Convert submissions to media items
  const mediaItems = useMemo<SubmissionMediaItem[]>(() => {
    const items: SubmissionMediaItem[] = [];
    
    submissions.forEach(submission => {
      if (submission.files && Array.isArray(submission.files) && submission.files.length > 0) {
        submission.files.forEach((file: any, index: number) => {
          const mediaType = getMediaTypeFromMime(file.type);
          
          items.push({
            id: `${submission.id}-${index}`,
            title: file.name || `Media från ${submission.title}`,
            url: file.url,
            type: mediaType,
            size: file.size,
            mimeType: file.type,
            thumbnail: file.thumbnail || (mediaType === 'image' ? file.url : undefined),
            submission,
            file,
            approved: submission.status === 'approved',
            convertedToMedia: false // This would come from database in real implementation
          });
        });
      }
    });
    
    return items;
  }, [submissions]);

  // Filter and search media items
  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!item.title.toLowerCase().includes(searchLower) &&
            !item.submission.title.toLowerCase().includes(searchLower) &&
            !item.submission.type.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter === 'pending' && item.approved) return false;
      if (statusFilter === 'approved' && !item.approved) return false;
      if (statusFilter === 'converted' && !item.convertedToMedia) return false;
      if (statusFilter === 'not-converted' && item.convertedToMedia) return false;
      
      return true;
    });
  }, [mediaItems, searchTerm, typeFilter, statusFilter]);

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedItems(filteredItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'convert') => {
    const selectedMediaItems = filteredItems.filter(item => selectedItems.includes(item.id));
    
    for (const item of selectedMediaItems) {
      switch (action) {
        case 'approve':
          await onApproveMedia(item);
          break;
        case 'reject':
          await onRejectMedia(item);
          break;
        case 'convert':
          await onConvertToMediaLibrary(selectedMediaItems);
          return; // Convert handles all items at once
      }
    }
    
    clearSelection();
  };

  // Stats
  const stats = useMemo(() => ({
    total: mediaItems.length,
    pending: mediaItems.filter(item => !item.approved).length,
    approved: mediaItems.filter(item => item.approved).length,
    images: mediaItems.filter(item => item.type === 'image').length,
    videos: mediaItems.filter(item => item.type === 'video').length,
    audio: mediaItems.filter(item => item.type === 'audio').length,
    documents: mediaItems.filter(item => item.type === 'document').length,
  }), [mediaItems]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="border-0 shadow-elegant bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold">Media från Inlämningar</h3>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Granska och hantera media-filer från inlämningar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Badge variant="secondary" className="text-xs sm:text-sm">{stats.total} filer</Badge>
              <Badge variant="outline" className="border-orange-200 text-orange-700 text-xs sm:text-sm">
                {stats.pending} väntande
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-3">
            {/* Search - Full width on mobile */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sök i media-filer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters - Stacked on mobile, row on desktop */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla typer</SelectItem>
                  <SelectItem value="image">Bilder</SelectItem>
                  <SelectItem value="video">Videor</SelectItem>
                  <SelectItem value="audio">Ljud</SelectItem>
                  <SelectItem value="document">Dokument</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla status</SelectItem>
                  <SelectItem value="pending">Väntande</SelectItem>
                  <SelectItem value="approved">Godkända</SelectItem>
                  <SelectItem value="converted">Konverterade</SelectItem>
                  <SelectItem value="not-converted">Ej konverterade</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode - Take remaining space on mobile */}
              <div className="flex border rounded-lg w-full sm:w-auto sm:ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="border-0 flex-1 sm:flex-initial"
                >
                  <Grid className="h-4 w-4" />
                  <span className="ml-2 sm:hidden">Rutnät</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="border-0 flex-1 sm:flex-initial"
                >
                  <List className="h-4 w-4" />
                  <span className="ml-2 sm:hidden">Lista</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-3">
              <span className="text-sm font-medium">{selectedItems.length} objekt valda</span>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  className="w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Godkänn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                  className="w-full sm:w-auto"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Avvisa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('convert')}
                  className="w-full sm:w-auto hidden sm:flex"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Konvertera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('convert')}
                  className="w-full sm:hidden"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Till bibliotek
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection} className="w-full sm:w-auto">
                  Rensa
                </Button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <Card className="p-2 sm:p-3">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.images}</div>
              <div className="text-xs text-muted-foreground">Bilder</div>
            </Card>
            <Card className="p-2 sm:p-3">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.videos}</div>
              <div className="text-xs text-muted-foreground">Videor</div>
            </Card>
            <Card className="p-2 sm:p-3">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.audio}</div>
              <div className="text-xs text-muted-foreground">Ljud</div>
            </Card>
            <Card className="p-2 sm:p-3">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.documents}</div>
              <div className="text-xs text-muted-foreground">Dokument</div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Inga media-filer hittades</h3>
              <p className="text-muted-foreground">
                Justera dina filter eller sök efter andra termer.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.length === filteredItems.length}
                    onCheckedChange={(checked) => checked ? selectAll() : clearSelection()}
                  />
                  <span className="text-sm font-medium">
                    Visar {filteredItems.length} av {mediaItems.length} filer
                  </span>
                </div>
              </div>

              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
                  : "space-y-2 sm:space-y-3"
              )}>
                {filteredItems.map((item) => (
                  <MediaItemCard
                    key={item.id}
                    item={item}
                    viewMode={viewMode}
                    selected={selectedItems.includes(item.id)}
                    onSelect={() => toggleSelection(item.id)}
                    onPreview={() => setPreviewItem(item)}
                    onApprove={() => onApproveMedia(item)}
                    onReject={() => onRejectMedia(item)}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {previewItem && (
        <MediaPreviewDialog
          item={previewItem}
          open={!!previewItem}
          onClose={() => setPreviewItem(null)}
          onApprove={() => onApproveMedia(previewItem)}
          onReject={() => onRejectMedia(previewItem)}
        />
      )}
    </div>
  );
};

// Helper component for individual media items
const MediaItemCard: React.FC<{
  item: SubmissionMediaItem;
  viewMode: 'grid' | 'list';
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onApprove: () => void;
  onReject: () => void;
}> = ({ item, viewMode, selected, onSelect, onPreview, onApprove, onReject }) => {
  const mediaIconElement = getMediaIcon(item.type as any);
  const colorClasses = getMediaTypeColor(item.type as any);

  if (viewMode === 'list') {
    return (
      <Card className={cn("p-4", selected && "ring-2 ring-primary")}>
        <div className="flex items-center gap-4">
          <Checkbox checked={selected} onCheckedChange={onSelect} />
          
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {item.type === 'image' && item.thumbnail ? (
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 text-muted-foreground">
                {mediaIconElement}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{item.title}</h4>
            <p className="text-sm text-muted-foreground truncate">
              Från: {item.submission.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={colorClasses}>
                {item.type}
              </Badge>
              {item.size && (
                <Badge variant="secondary">{formatFileSize(item.size)}</Badge>
              )}
              <Badge variant={item.approved ? "default" : "secondary"}>
                {item.approved ? 'Godkänd' : 'Väntande'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onPreview}>
              <Eye className="h-4 w-4" />
            </Button>
            {!item.approved && (
              <>
                <Button variant="ghost" size="sm" onClick={onApprove}>
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onReject}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("group", selected && "ring-2 ring-primary")}>
      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          className="absolute top-2 left-2 z-10"
        />
        
        {!item.approved && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 z-10 bg-yellow-100 text-yellow-800"
          >
            Väntande
          </Badge>
        )}
        
        {item.type === 'image' && item.thumbnail ? (
          <img 
            src={item.thumbnail} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            {React.cloneElement(mediaIconElement, { className: "h-16 w-16" })}
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" onClick={onPreview}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-medium truncate mb-1">{item.title}</h4>
        <p className="text-sm text-muted-foreground truncate mb-2">
          {item.submission.title}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={cn("text-xs", colorClasses)}>
              {item.type}
            </Badge>
            {item.size && (
              <Badge variant="secondary" className="text-xs">
                {formatFileSize(item.size)}
              </Badge>
            )}
          </div>
          
          {!item.approved && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onApprove}>
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onReject}>
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for media preview
const MediaPreviewDialog: React.FC<{
  item: SubmissionMediaItem;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}> = ({ item, open, onClose, onApprove, onReject }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Media Preview */}
          <div className="bg-muted rounded-lg overflow-hidden">
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={item.title}
                className="w-full max-h-96 object-contain"
              />
            ) : item.type === 'video' ? (
              <video 
                src={item.url} 
                controls 
                className="w-full max-h-96"
              />
            ) : item.type === 'audio' ? (
              <div className="p-8 text-center">
                <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <audio src={item.url} controls className="w-full" />
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Dokumentförhandsvisning ej tillgänglig</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Ladda ner
                  </a>
                </Button>
              </div>
            )}
          </div>
          
          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Från inlämning:</strong> {item.submission.title}
            </div>
            <div>
              <strong>Typ:</strong> {item.submission.type}
            </div>
            <div>
              <strong>Filtyp:</strong> {item.mimeType}
            </div>
            {item.size && (
              <div>
                <strong>Storlek:</strong> {formatFileSize(item.size)}
              </div>
            )}
            <div>
              <strong>Status:</strong> {item.approved ? 'Godkänd' : 'Väntande godkännande'}
            </div>
            <div>
              <strong>Inlämnad:</strong> {new Date(item.submission.created_at).toLocaleDateString('sv-SE')}
            </div>
          </div>
          
          {/* Actions */}
          {!item.approved && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={onApprove} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Godkänn Media
              </Button>
              <Button variant="outline" onClick={onReject} className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Avvisa Media
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to determine media type from MIME type
function getMediaTypeFromMime(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}