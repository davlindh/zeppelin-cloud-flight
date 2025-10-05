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
  Image,
  Video,
  Music,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getMediaIcon, getMediaTypeColor, getCategoryColor, formatFileSize } from '@/utils/mediaHelpers';

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

  const fetchApprovedMedia = async () => {
    try {
      setLoading(true);
      
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Optimized query: only select needed fields, use pagination
      const { data: submissions, error: submissionError, count } = await supabase
        .from('submissions')
        .select('id, title, content, thumbnail_url, created_at', { count: 'exact' })
        .eq('type', 'media')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (submissionError) throw submissionError;

      // Transform submissions to MediaItem format
      const transformedItems: MediaItem[] = (submissions || [])
        .filter(sub => (sub.content as any)?.publication_permission === true)
        .map(sub => ({
          id: sub.id,
          title: sub.title,
          description: (sub.content as any)?.description,
          media_type: (sub.content as any)?.media_type,
          category: (sub.content as any)?.category,
          uploader_name: (sub.content as any)?.uploader_name,
          event_date: (sub.content as any)?.event_date,
          files: (sub.content as any)?.files || [],
          created_at: sub.created_at
        }))
        .filter(item => item.files.length > 0);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Laddar mediagalleri...</span>
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
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mediagalleri från eventet</span>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök i media..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla typer</SelectItem>
                  <SelectItem value="image">Bilder</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="audio">Ljud</SelectItem>
                  <SelectItem value="document">Dokument</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-36">
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
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Visar {filteredItems.length} av {mediaItems.length} mediafiler
            </span>
            <span>
              Sortering: Senast först
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
          {filteredItems.map(item => 
            viewMode === 'grid' ? renderGridItem(item) : renderListItem(item)
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Inga mediafiler hittades med de valda filtren.</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredItems.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
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

      {/* Item Detail Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  ✕
                </Button>
              </div>
              
              {selectedItem.description && (
                <p className="text-gray-700 mb-4">{selectedItem.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p><strong>Uppladdare:</strong> {selectedItem.uploader_name}</p>
                  <p><strong>Kategori:</strong> {
                    selectedItem.category === 'presentation' ? 'Presentation' :
                    selectedItem.category === 'workshop' ? 'Workshop' :
                    selectedItem.category === 'networking' ? 'Mingel' :
                    selectedItem.category === 'performance' ? 'Uppträdande' :
                    selectedItem.category === 'discussion' ? 'Diskussion' : 'Övrigt'
                  }</p>
                </div>
                <div>
                  <p><strong>Typ:</strong> {
                    selectedItem.media_type === 'image' ? 'Bild' :
                    selectedItem.media_type === 'video' ? 'Video' :
                    selectedItem.media_type === 'audio' ? 'Ljud' : 'Dokument'
                  }</p>
                  {selectedItem.event_date && (
                    <p><strong>Eventdatum:</strong> {new Date(selectedItem.event_date).toLocaleDateString('sv-SE')}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {selectedItem.files.map((file, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{file.filename}</span>
                      <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    
                    {selectedItem.media_type === 'image' && (
                      <img src={file.url} alt={selectedItem.title} className="max-w-full h-auto rounded" />
                    )}
                    
                    {selectedItem.media_type === 'video' && (
                      <video src={file.url} controls className="max-w-full h-auto rounded" />
                    )}
                    
                    {selectedItem.media_type === 'audio' && (
                      <audio src={file.url} controls className="w-full" />
                    )}
                    
                    <div className="mt-2 flex gap-2">
                      {selectedItem.media_type === 'document' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Öppna
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(file.url, file.filename)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Ladda ner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};