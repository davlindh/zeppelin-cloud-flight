import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Grid,
  List,
  Play,
  Download,
  Eye,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { getMediaIcon, getMediaTypeColor } from '@/utils/media';

// Helper functions
const formatFileSize = (bytes: number = 0): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'presentation': 'bg-blue-100 text-blue-700',
    'workshop': 'bg-purple-100 text-purple-700',
    'networking': 'bg-green-100 text-green-700',
    'performance': 'bg-pink-100 text-pink-700',
    'discussion': 'bg-orange-100 text-orange-700'
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};
import { MediaGridSkeleton } from '@/components/media/core/MediaGridSkeleton';

interface MediaItem {
  id: string;
  title: string;
  description?: string;
  media_type: 'image' | 'video' | 'audio' | 'document';
  category: string;
  uploader_name: string;
  event_date?: string;
  files: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType?: string;
  }>;
  created_at: string;
}

interface PublicMediaGalleryProps {
  className?: string;
}

export const PublicMediaGallery: React.FC<PublicMediaGalleryProps> = ({ className }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [imageZoomed, setImageZoomed] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchApprovedMedia();
  }, [currentPage]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    filterItems();
  }, [mediaItems, debouncedSearch, selectedType, selectedCategory]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
        setImageZoomed(false);
      } else if (e.key === 'ArrowLeft') {
        navigateMedia('prev');
      } else if (e.key === 'ArrowRight') {
        navigateMedia('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, filteredItems]);

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex(item => item.id === selectedItem.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + filteredItems.length) % filteredItems.length
      : (currentIndex + 1) % filteredItems.length;
    
    setSelectedItem(filteredItems[newIndex]);
    setImageZoomed(false);
  };

  const getEventCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'presentation': 'bg-blue-100 text-blue-700 border-blue-300',
      'workshop': 'bg-purple-100 text-purple-700 border-purple-300',
      'networking': 'bg-green-100 text-green-700 border-green-300',
      'performance': 'bg-pink-100 text-pink-700 border-pink-300',
      'discussion': 'bg-orange-100 text-orange-700 border-orange-300'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const fetchApprovedMedia = async () => {
    try {
      setLoading(true);
      
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Query media_library table for approved and public media
      const { data: mediaLibrary, error: mediaError, count } = await supabase
        .from('media_library')
        .select('id, title, description, type, category, public_url, thumbnail_url, file_size, mime_type, uploaded_at, tags, created_at', { count: 'exact' })
        .eq('status', 'approved')
        .eq('is_public', true)
        .order('uploaded_at', { ascending: false })
        .range(from, to);

      if (mediaError) throw mediaError;

      // Transform media_library records to MediaItem format
      const transformedItems: MediaItem[] = (mediaLibrary || []).map(media => ({
        id: media.id,
        title: media.title,
        description: media.description || undefined,
        media_type: media.type as 'image' | 'video' | 'audio' | 'document',
        category: media.category || 'general',
        uploader_name: 'Deltagare',
        event_date: media.created_at,
        files: [{
          filename: media.title,
          url: media.public_url,
          size: media.file_size || 0,
          mimeType: media.mime_type || undefined
        }],
        created_at: media.created_at
      }));

      setMediaItems(prev => currentPage === 1 ? transformedItems : [...prev, ...transformedItems]);
      setHasMore((count || 0) > currentPage * itemsPerPage);
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Kunde inte ladda mediagalleri');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...mediaItems];

    // Search filter (debounced)
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.uploader_name.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.media_type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMediaPreview = (item: MediaItem) => {
    const primaryFile = item.files[0];
    if (!primaryFile) return null;

    switch (item.media_type) {
      case 'image':
        return (
          <div className="relative group cursor-pointer" onClick={() => setSelectedItem(item)}>
            <img
              src={primaryFile.url}
              alt={item.title}
              loading="lazy"
              className="w-full h-48 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
              onError={(e) => {
                e.currentTarget.src = '/images/ui/placeholder-project.jpg';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="bg-black/70 text-white">
                <Eye className="w-4 h-4 mr-2" />
                Visa
              </Button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="relative bg-muted rounded-lg h-48 flex items-center justify-center group cursor-pointer" onClick={() => setSelectedItem(item)}>
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-950 dark:to-red-900 rounded-lg opacity-50" />
            <Play className="w-12 h-12 text-red-600 dark:text-red-400 relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400">
                <Video className="w-3 h-3 mr-1" />
                Video
              </Badge>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 flex flex-col justify-center items-center">
            <Music className="w-12 h-12 text-purple-600 mb-4" />
            <p className="font-medium text-center mb-4">{item.title}</p>
            <audio src={primaryFile.url} controls className="w-full" />
          </div>
        );

      case 'document':
        return (
          <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4 flex flex-col justify-center items-center">
            <FileText className="w-12 h-12 text-orange-600 mb-4" />
            <p className="font-medium text-center mb-2">{item.title}</p>
            <p className="text-sm text-gray-600 mb-4">{formatFileSize(primaryFile.size)}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(primaryFile.url, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Öppna
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadFile(primaryFile.url, primaryFile.filename)}
              >
                <Download className="w-4 h-4 mr-2" />
                Ladda ner
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-48 bg-gray-100 rounded-lg p-4 flex flex-col justify-center items-center">
            {getMediaIcon(item.media_type, "w-12 h-12 text-gray-600 mb-4")}
            <p className="font-medium text-center">{item.title}</p>
          </div>
        );
    }
  };

  const renderGridItem = (item: MediaItem) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {renderMediaPreview(item)}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
            <Badge className={getMediaTypeColor(item.media_type)} variant="secondary">
              {item.media_type === 'image' ? 'Bild' :
               item.media_type === 'video' ? 'Video' :
               item.media_type === 'audio' ? 'Ljud' : 'Dok'}
            </Badge>
          </div>
          
          {item.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{item.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {item.uploader_name}
            </span>
            {item.event_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(item.event_date).toLocaleDateString('sv-SE')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderListItem = (item: MediaItem) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0">
            {item.media_type === 'image' ? (
              <img
                src={item.files[0]?.url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/images/ui/placeholder-project.jpg';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                {getMediaIcon(item.media_type, "w-8 h-8 text-gray-600")}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
              <div className="flex gap-2">
                <Badge className={getMediaTypeColor(item.media_type)}>
                  {item.media_type === 'image' ? 'Bild' :
                   item.media_type === 'video' ? 'Video' :
                   item.media_type === 'audio' ? 'Ljud' : 'Dokument'}
                </Badge>
                <Badge className={getCategoryColor(item.category as any)}>
                  {item.category === 'presentation' ? 'Presentation' :
                   item.category === 'workshop' ? 'Workshop' :
                   item.category === 'networking' ? 'Mingel' :
                   item.category === 'performance' ? 'Uppträdande' :
                   item.category === 'discussion' ? 'Diskussion' : 'Övrigt'}
                </Badge>
              </div>
            </div>
            
            {item.description && (
              <p className="text-gray-600 line-clamp-2 mb-2">{item.description}</p>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {item.uploader_name}
                </span>
                {item.event_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.event_date).toLocaleDateString('sv-SE')}
                  </span>
                )}
                <span>{item.files.length} fil(er)</span>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedItem(item)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visa detaljer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && currentPage === 1) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="h-8 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-muted animate-pulse rounded-lg" />
              <div className="w-32 h-10 bg-muted animate-pulse rounded-lg" />
              <div className="w-36 h-10 bg-muted animate-pulse rounded-lg" />
            </div>
          </CardContent>
        </Card>
        <MediaGridSkeleton count={12} viewMode={viewMode} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header and Filters */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-2xl font-bold">Mediagalleri från eventet</span>
            <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'shadow-sm' : ''}
              >
                <Grid className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Rutnät</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'shadow-sm' : ''}
              >
                <List className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Lista</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Sök bland bilder, videor och dokument..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-10 py-6 text-base border-2 rounded-xl hover:border-primary/30 focus:border-primary transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Rensa sökning"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-36 border-2 rounded-lg hover:border-primary/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla typer</SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Bilder
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Videos
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Ljud
                    </div>
                  </SelectItem>
                  <SelectItem value="document">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Dokument
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 border-2 rounded-lg hover:border-primary/50 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla kategorier</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="networking">Mingel</SelectItem>
                  <SelectItem value="performance">Uppträdande</SelectItem>
                  <SelectItem value="discussion">Diskussion</SelectItem>
                  <SelectItem value="other">Övrigt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              {filteredItems.length !== mediaItems.length ? (
                <>
                  <span className="text-primary font-semibold">{filteredItems.length}</span>
                  <span className="text-muted-foreground mx-1.5">av</span>
                  <span>{mediaItems.length}</span>
                </>
              ) : (
                <span>{mediaItems.length} mediafiler</span>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Senast först
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      {filteredItems.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredItems.map((item, index) => (
            <div 
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {viewMode === 'grid' ? renderGridItem(item) : renderListItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all' 
                ? 'Inga resultat' 
                : 'Inga mediafiler ännu'}
            </h3>
            <p className="text-muted-foreground text-lg mb-6">
              {searchTerm 
                ? `Inga mediafiler matchade din sökning "${searchTerm}"`
                : selectedType !== 'all' || selectedCategory !== 'all'
                ? 'Prova att ändra dina filter för att se fler resultat'
                : 'Det finns inga mediafiler att visa just nu. Kom tillbaka senare!'}
            </p>
            {(searchTerm || selectedType !== 'all' || selectedCategory !== 'all') && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Rensa alla filter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredItems.length > 0 && (
        <div className="flex justify-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-base hover:shadow-lg transition-all min-w-[200px]"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Laddar...
              </>
            ) : (
              'Ladda fler mediafiler'
            )}
          </Button>
        </div>
      )}

      {/* Enhanced Item Detail Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => {
            setSelectedItem(null);
            setImageZoomed(false);
          }}
        >
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 z-10"
            onClick={(e) => {
              e.stopPropagation();
              navigateMedia('prev');
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 z-10"
            onClick={(e) => {
              e.stopPropagation();
              navigateMedia('next');
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 h-10 w-10 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(null);
              setImageZoomed(false);
            }}
          >
            <X className="w-6 h-6" />
          </Button>

          <div 
            className="bg-card rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Metadata */}
            <div className="p-4 border-b bg-background/95 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-semibold mb-2 truncate">{selectedItem.title}</h2>
                  {selectedItem.description && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{selectedItem.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={getMediaTypeColor(selectedItem.media_type)}>
                      {getMediaIcon(selectedItem.media_type)}
                      <span className="ml-1">
                        {selectedItem.media_type === 'image' ? 'Bild' :
                         selectedItem.media_type === 'video' ? 'Video' :
                         selectedItem.media_type === 'audio' ? 'Ljud' : 'Dokument'}
                      </span>
                    </Badge>
                    <Badge variant="outline" className={getEventCategoryColor(selectedItem.category)}>
                      <Tag className="w-3 h-3 mr-1" />
                      {selectedItem.category === 'presentation' ? 'Presentation' :
                       selectedItem.category === 'workshop' ? 'Workshop' :
                       selectedItem.category === 'networking' ? 'Mingel' :
                       selectedItem.category === 'performance' ? 'Uppträdande' :
                       selectedItem.category === 'discussion' ? 'Diskussion' : 'Övrigt'}
                    </Badge>
                    <Badge variant="outline">
                      <User className="w-3 h-3 mr-1" />
                      {selectedItem.uploader_name}
                    </Badge>
                    {selectedItem.event_date && (
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(selectedItem.event_date).toLocaleDateString('sv-SE')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Media Content */}
            <div className="flex-1 overflow-y-auto bg-muted/20">
              <div className="p-6">
                {selectedItem.files.map((file, index) => (
                  <div key={index} className="space-y-4">
                    {selectedItem.media_type === 'image' && (
                      <div 
                        className={`relative ${imageZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                        onClick={() => setImageZoomed(!imageZoomed)}
                      >
                        <img 
                          src={file.url} 
                          alt={selectedItem.title} 
                          className={`w-full rounded-lg transition-all duration-300 ${
                            imageZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 object-contain max-h-[70vh]'
                          }`}
                        />
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm">
                          {imageZoomed ? 'Klicka för att zooma ut' : 'Klicka för att zooma in'}
                        </div>
                      </div>
                    )}
                    
                    {selectedItem.media_type === 'video' && (
                      <video 
                        src={file.url} 
                        controls 
                        className="w-full rounded-lg max-h-[70vh]"
                      />
                    )}
                    
                    {selectedItem.media_type === 'audio' && (
                      <div className="bg-background p-8 rounded-lg border-2 border-dashed">
                        <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <audio src={file.url} controls className="w-full" />
                      </div>
                    )}

                    {selectedItem.media_type === 'document' && (
                      <div className="bg-background p-8 rounded-lg border-2 border-dashed text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <p className="font-medium mb-2">{file.filename}</p>
                        <p className="text-sm text-muted-foreground mb-4">{formatFileSize(file.size)}</p>
                      </div>
                    )}
                    
                    {/* File Actions */}
                    <div className="flex gap-2 justify-center">
                      {selectedItem.media_type === 'document' && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Öppna dokument
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => downloadFile(file.url, file.filename)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Ladda ner ({formatFileSize(file.size)})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer with keyboard hints */}
            <div className="px-4 py-3 border-t bg-background/95 backdrop-blur">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex gap-4">
                  <span><kbd className="px-2 py-1 bg-muted rounded">←</kbd> <kbd className="px-2 py-1 bg-muted rounded">→</kbd> Navigera</span>
                  <span><kbd className="px-2 py-1 bg-muted rounded">ESC</kbd> Stäng</span>
                </div>
                <span>{filteredItems.findIndex(i => i.id === selectedItem.id) + 1} / {filteredItems.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};