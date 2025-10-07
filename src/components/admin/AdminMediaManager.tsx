import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Image, 
  Video, 
  Music, 
  FileText,
  Upload,
  Trash2,
  Edit,
  Eye,
  Download,
  Star,
  StarOff,
  Tags,
  Calendar,
  User,
  Folder,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Settings
} from 'lucide-react';
import { MediaGallery } from '@/components/multimedia/MediaGallery';
import { FileUpload } from './FileUpload';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  thumbnail_url?: string;
  mime_type: string;
  size: number;
  category: string;
  tags: string[];
  is_public: boolean;
  metadata: any;
  created_by: string;
  created_at: string;
  updated_at: string;
  participant_id?: string;
  project_id?: string;
}

interface MediaFilters {
  type: string;
  category: string;
  tag: string;
  isPublic: string;
  dateRange: string;
  sizeRange: string;
  project: string;
  participant: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const initialFilters: MediaFilters = {
  type: 'all',
  category: 'all',
  tag: 'all',
  isPublic: 'all',
  dateRange: 'all',
  sizeRange: 'all',
  project: 'all',
  participant: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc'
};

export const AdminMediaManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MediaFilters>(initialFilters);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'gallery'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  // Fetch media items
  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ['admin-media-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MediaItem[];
    }
  });

  // Fetch related data for filters
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-for-media'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['participants-for-media'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Delete media mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaIds: string[]) => {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .in('id', mediaIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media-items'] });
      setSelectedMedia([]);
      toast({
        title: 'Media borttagen',
        description: 'De valda media-filerna har tagits bort.'
      });
    }
  });

  // Update media mutation
  const updateMediaMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<MediaItem> }) => {
      const { error } = await supabase
        .from('media_items')
        .update(data.updates)
        .eq('id', data.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media-items'] });
      setEditingMedia(null);
      toast({
        title: 'Media uppdaterad',
        description: 'Media-filen har uppdaterats.'
      });
    }
  });

  // Filtered and sorted media
  const filteredMediaItems = useMemo(() => {
    const filtered = mediaItems.filter(item => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          item.filename.toLowerCase().includes(searchLower) ||
          item.original_name?.toLowerCase().includes(searchLower) ||
          item.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
          item.category?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type !== 'all') {
        const mediaType = item.mime_type.split('/')[0];
        if (mediaType !== filters.type) return false;
      }

      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) return false;

      // Tag filter
      if (filters.tag !== 'all' && !item.tags?.includes(filters.tag)) return false;

      // Public filter
      if (filters.isPublic !== 'all') {
        const isPublic = filters.isPublic === 'true';
        if (item.is_public !== isPublic) return false;
      }

      // Project filter
      if (filters.project !== 'all' && item.project_id !== filters.project) return false;

      // Participant filter
      if (filters.participant !== 'all' && item.participant_id !== filters.participant) return false;

      // Date range filter
      if (filters.dateRange !== 'all') {
        const itemDate = new Date(item.created_at);
        const now = new Date();
        const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff > 1) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }

      // Size range filter
      if (filters.sizeRange !== 'all') {
        const sizeMB = item.size / (1024 * 1024);
        switch (filters.sizeRange) {
          case 'small':
            if (sizeMB > 1) return false;
            break;
          case 'medium':
            if (sizeMB <= 1 || sizeMB > 10) return false;
            break;
          case 'large':
            if (sizeMB <= 10) return false;
            break;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'filename':
          aValue = a.filename.toLowerCase();
          bValue = b.filename.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [mediaItems, searchTerm, filters]);

  // Stats
  const stats = useMemo(() => {
    const totalSize = mediaItems.reduce((sum, item) => sum + item.size, 0);
    const typeStats = mediaItems.reduce((acc, item) => {
      const type = item.mime_type.split('/')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: mediaItems.length,
      totalSize: totalSize / (1024 * 1024), // MB
      public: mediaItems.filter(item => item.is_public).length,
      private: mediaItems.filter(item => !item.is_public).length,
      images: typeStats.image || 0,
      videos: typeStats.video || 0,
      audio: typeStats.audio || 0,
      documents: typeStats.application || 0
    };
  }, [mediaItems]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(mediaItems.map(item => item.category).filter(Boolean))];
    const tags = [...new Set(mediaItems.flatMap(item => item.tags || []))];
    
    return { categories, tags };
  }, [mediaItems]);

  const handleBulkDelete = async () => {
    if (selectedMedia.length === 0) return;
    
    if (confirm(`Är du säker på att du vill ta bort ${selectedMedia.length} media-filer?`)) {
      deleteMediaMutation.mutate(selectedMedia);
    }
  };

  const handleBulkTogglePublic = async () => {
    const updates = selectedMedia.map(id => {
      const item = mediaItems.find(m => m.id === id);
      return updateMediaMutation.mutateAsync({
        id,
        updates: { is_public: !item?.is_public }
      });
    });
    
    await Promise.all(updates);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-elegant bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Media Manager</h2>
                <p className="text-sm text-muted-foreground">
                  Hantera och organisera alla media-filer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.total} filer</Badge>
              <Badge variant="outline">{stats.totalSize.toFixed(1)} MB</Badge>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ladda upp
              </Button>
            </div>
          </CardTitle>

          {/* Search and Controls */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök efter filnamn, taggar, kategorier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-primary/10")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Rutnät</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                  <SelectItem value="gallery">Galleri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="bg-background border rounded-lg p-3 text-center">
                <Image className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <div className="text-sm font-medium">{stats.images}</div>
                <div className="text-xs text-muted-foreground">Bilder</div>
              </div>
              <div className="bg-background border rounded-lg p-3 text-center">
                <Video className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <div className="text-sm font-medium">{stats.videos}</div>
                <div className="text-xs text-muted-foreground">Videor</div>
              </div>
              <div className="bg-background border rounded-lg p-3 text-center">
                <Music className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <div className="text-sm font-medium">{stats.audio}</div>
                <div className="text-xs text-muted-foreground">Ljud</div>
              </div>
              <div className="bg-background border rounded-lg p-3 text-center">
                <FileText className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                <div className="text-sm font-medium">{stats.documents}</div>
                <div className="text-xs text-muted-foreground">Dokument</div>
              </div>
              <div className="bg-background border rounded-lg p-3 text-center">
                <Eye className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <div className="text-sm font-medium">{stats.public}</div>
                <div className="text-xs text-muted-foreground">Publika</div>
              </div>
              <div className="bg-background border rounded-lg p-3 text-center">
                <div className="h-5 w-5 mx-auto bg-red-100 rounded-full mb-1"></div>
                <div className="text-sm font-medium">{stats.private}</div>
                <div className="text-xs text-muted-foreground">Privata</div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-background border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => setFilters({ ...filters, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla typer</SelectItem>
                      <SelectItem value="image">Bilder</SelectItem>
                      <SelectItem value="video">Videor</SelectItem>
                      <SelectItem value="audio">Ljud</SelectItem>
                      <SelectItem value="application">Dokument</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.category} 
                    onValueChange={(value) => setFilters({ ...filters, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla kategorier</SelectItem>
                      {filterOptions.categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.isPublic} 
                    onValueChange={(value) => setFilters({ ...filters, isPublic: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Synlighet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla</SelectItem>
                      <SelectItem value="true">Publika</SelectItem>
                      <SelectItem value="false">Privata</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.sortBy} 
                    onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sortera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Datum</SelectItem>
                      <SelectItem value="filename">Filnamn</SelectItem>
                      <SelectItem value="size">Storlek</SelectItem>
                      <SelectItem value="category">Kategori</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedMedia.length > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedMedia.length} filer markerade
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkTogglePublic}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Växla synlighet
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDelete}
                      className="border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Ta bort
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Visar {filteredMediaItems.length} av {stats.total} filer
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ 
                  ...filters, 
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                })}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                {filters.sortOrder === 'asc' ? 'Stigande' : 'Fallande'}
              </Button>
            </div>

            {/* Media Grid/List/Gallery */}
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : viewMode === 'gallery' ? (
              <MediaGallery 
                media={filteredMediaItems.map(item => ({
                  id: item.id,
                  title: item.original_name || item.filename,
                  url: item.url,
                  thumbnail: item.thumbnail_url,
                  type: item.mime_type.split('/')[0] as any,
                  description: `${formatFileSize(item.size)} • ${item.category}`,
                }))} 
                viewMode="gallery" 
              />
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                  : "space-y-2"
              )}>
                {filteredMediaItems.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "group border rounded-lg overflow-hidden hover:shadow-md transition-all",
                      viewMode === 'list' && "flex items-center p-3"
                    )}
                  >
                    <Checkbox
                      checked={selectedMedia.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMedia(prev => [...prev, item.id]);
                        } else {
                          setSelectedMedia(prev => prev.filter(id => id !== item.id));
                        }
                      }}
                      className="absolute top-2 left-2 z-10"
                    />
                    
                    {viewMode === 'grid' ? (
                      <div className="aspect-square relative">
                        {item.mime_type.startsWith('image/') ? (
                          <img 
                            src={item.thumbnail_url || item.url} 
                            alt={item.original_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-xs truncate">{item.original_name}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center mr-3">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.original_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(item.size)} • {item.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.is_public && (
                            <Badge variant="secondary" className="text-xs">Publik</Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ladda upp media</DialogTitle>
          </DialogHeader>
          <FileUpload
            acceptedTypes="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onFileSelect={(file) => {
              // Handle file upload
              setShowUploadDialog(false);
            }}
            bucketName="media-files"
            maxSizeMB={50}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};