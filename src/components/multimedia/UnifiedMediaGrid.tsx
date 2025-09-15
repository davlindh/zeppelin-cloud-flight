import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUnifiedMedia } from '@/contexts/UnifiedMediaContext';
import { MediaGridSkeleton } from './MediaGridSkeleton';
import { EnhancedImageProps } from '@/components/multimedia/EnhancedImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Image as ImageIcon,
  FileText,
  Download,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UnifiedMediaItem } from '@/types/unified-media';
import {
  getMediaIcon,
  getMediaTypeColor,
  getCategoryColor,
  getCategoryIcon,
  isPlayableMedia,
  formatFileSize,
  formatDuration,
  getMediaPreviewUrl
} from '@/utils/mediaHelpers';

// Local fallback EnhancedImage component used when external module is not available
const EnhancedImage: React.FC<{ src: string; alt?: string; className?: string }> = ({ src, alt, className }) => {
  return <img src={src} alt={alt || ''} className={className} loading="lazy" />;
};

// Constants
const IMAGE_LOAD_DELAY = 300;
const DEFAULT_SKELETON_COUNT = 6;
const GRID_BREAKPOINTS = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
const LIST_LAYOUT = "space-y-3";
const MASONRY_LAYOUT = "columns-1 md:columns-2 lg:columns-3 gap-4";

interface UnifiedMediaGridProps {
  media?: UnifiedMediaItem[];
  viewMode?: 'grid' | 'list';
  showPreview?: boolean;
  showPlayButton?: boolean;
  showAddToQueue?: boolean;
  showDownloadButton?: boolean;
  showMetadata?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableViewModeToggle?: boolean;
  className?: string;
  loading?: boolean;
  skeletonCount?: number;
  emptyStateMessage?: string;
}

export const UnifiedMediaGrid: React.FC<UnifiedMediaGridProps> = ({
  media: propMedia,
  viewMode: propViewMode = 'grid',
  showPreview = true,
  showPlayButton = true,
  showAddToQueue = true,
  showDownloadButton = true,
  showMetadata = false,
  enableSearch = false,
  enableFilters = false,
  enableViewModeToggle = false,
  className,
  loading = false,
  skeletonCount = DEFAULT_SKELETON_COUNT,
  emptyStateMessage = 'Inga mediafiler hittades.'
}) => {
  const { state, actions } = useUnifiedMedia();

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localViewMode, setLocalViewMode] = useState(propViewMode);

  // Use prop media if provided, otherwise use filtered media from context
  const media = propMedia || state.filteredItems;

  // Use local view mode since displayConfig doesn't exist
  const currentViewMode = propViewMode !== 'grid' ? propViewMode : localViewMode;

  const effectiveViewMode = enableViewModeToggle ? localViewMode : currentViewMode;

  useEffect(() => {
    if (media.length > 0) {
      const timer = setTimeout(() => setImagesLoaded(true), IMAGE_LOAD_DELAY);
      return () => clearTimeout(timer);
    }
  }, [media.length]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (enableSearch) {
      actions.searchItems(query);
    }
  };

  // Filter controls
  const FilterControls = () => {
    if (!enableFilters) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Sök media..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 pr-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => actions.setFilters({ type: undefined })}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
    );
  };

  // View mode toggle
  const ViewModeToggle = () => {
    if (!enableViewModeToggle) return null;

    return (
      <div className="flex gap-1 mb-4 border rounded-lg p-1">
        <Button
          variant={effectiveViewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLocalViewMode('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={effectiveViewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLocalViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Show skeleton while loading
  if (loading || (!imagesLoaded && media.length > 0)) {
    return (
      <div className="space-y-4">
        {enableFilters && <FilterControls />}
        {enableViewModeToggle && <ViewModeToggle />}
        <MediaGridSkeleton
          count={skeletonCount}
          viewMode={effectiveViewMode}
          className={className}
        />
      </div>
    );
  }

  // Empty state
  if (media.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyStateMessage}</p>
      </div>
    );
  }

  // Handle media action
  const handleMediaAction = (mediaItem: UnifiedMediaItem) => {
    if (isPlayableMedia(mediaItem.type)) {
      // For now, just open playable media in new tab
      window.open(mediaItem.url, '_blank', 'noopener,noreferrer');
    } else {
      // For non-playable media, open in new tab
      window.open(mediaItem.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Container class based on view mode
  const containerClass = cn(
    effectiveViewMode === 'grid'
      ? GRID_BREAKPOINTS
      : LIST_LAYOUT,
    className
  );

  return (
    <div className="space-y-4">
      {enableFilters && <FilterControls />}
      {enableViewModeToggle && <ViewModeToggle />}

      <div className={containerClass}>
        {media.map((item) => (
          <UnifiedMediaItem
            key={item.id}
            item={item}
            viewMode={effectiveViewMode}
            showPreview={showPreview}
            showPlayButton={showPlayButton}
            showAddToQueue={showAddToQueue}
            showDownloadButton={showDownloadButton}
            showMetadata={showMetadata}
            onPlay={handleMediaAction}
          />
        ))}
      </div>
    </div>
  );
};

// Individual media item component
interface UnifiedMediaItemProps {
  item: UnifiedMediaItem;
  viewMode: 'grid' | 'list' | 'masonry';
  showPreview: boolean;
  showPlayButton: boolean;
  showAddToQueue: boolean;
  showDownloadButton: boolean;
  showMetadata: boolean;
  onPlay: (item: UnifiedMediaItem) => void;
}

const UnifiedMediaItem: React.FC<UnifiedMediaItemProps> = React.memo(({
  item,
  viewMode,
  showPreview,
  showPlayButton,
  showAddToQueue,
  showDownloadButton,
  showMetadata,
  onPlay
}) => {
  const { state, actions } = useUnifiedMedia();

  const handleAddToQueue = () => {
    actions.toggleSelection(item.id);
  };

  if (viewMode === 'list') {
    return (
      <Card className="card-enhanced border-0 shadow-soft hover:shadow-elegant transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Preview */}
            {showPreview && (
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                {item.type === 'image' ? (
                  <EnhancedImage
                    src={getMediaPreviewUrl(item.url, item.type)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getMediaIcon(item.type, 'w-6 h-6')}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getMediaTypeColor(item.type))}
                  >
                    {getMediaIcon(item.type, 'w-3 h-3')}
                    <span className="ml-1">{item.type}</span>
                  </Badge>

                  <Badge
                    variant="outline"
                    className={cn("text-xs", getCategoryColor(item.category))}
                  >
                    {getCategoryIcon(item.category, 'w-3 h-3')}
                  </Badge>
                </div>
              </div>

              {/* Metadata */}
              {showMetadata && (
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {item.year && <span>År: {item.year}</span>}
                  {item.size && <span>{formatFileSize(item.size)}</span>}
                  {item.duration && <span>{formatDuration(item.duration)}</span>}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {showPlayButton && (
                <Button
                  size="sm"
                  onClick={() => onPlay(item)}
                  variant="outline"
                >
                  {getMediaIcon(item.type, 'w-4 h-4')}
                  <span className="ml-2">
                    {isPlayableMedia(item.type) ? 'Spela' : 'Öppna'}
                  </span>
                </Button>
              )}

              {showAddToQueue && isPlayableMedia(item.type) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddToQueue}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}

              {showDownloadButton && (
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                >
                  <a
                    href={item.url}
                    download={item.title}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid/Masonry view
  return (
    <Card className="card-enhanced border-0 shadow-soft hover:shadow-elegant transition-all duration-300 group overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            <Badge
              variant="outline"
              className={cn("flex-shrink-0", getMediaTypeColor(item.type))}
            >
              {getMediaIcon(item.type, 'w-3 h-3')}
              <span className="ml-1 text-xs uppercase">{item.type}</span>
            </Badge>
          </div>

          {/* Media Preview */}
          {showPreview && (
            <>
              {item.type === 'image' && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <EnhancedImage
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {(item.type === 'video' || item.type === 'audio') && (
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="h-6 w-6 text-primary ml-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground">Klicka för att spela</p>
                  </div>
                </div>
              )}

              {item.type === 'document' && (
                <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground">Dokument</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Metadata */}
          {showMetadata && (
            <div className="text-xs text-muted-foreground space-y-1">
              {item.year && <div>År: {item.year}</div>}
              {item.size && <div>Storlek: {formatFileSize(item.size)}</div>}
              {item.duration && <div>Längd: {formatDuration(item.duration)}</div>}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showPlayButton && (
              <Button
                size="sm"
                onClick={() => onPlay(item)}
                className="flex-1"
                variant="outline"
              >
                {getMediaIcon(item.type, 'w-4 h-4')}
                <span className="ml-2">
                  {isPlayableMedia(item.type) ? 'Spela' : 'Öppna'}
                </span>
              </Button>
            )}

            {showAddToQueue && isPlayableMedia(item.type) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddToQueue}
                className="px-2"
                title="Lägg till i kö"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {showDownloadButton && (
              <Button
                size="sm"
                variant="ghost"
                asChild
                className="px-2"
                title="Ladda ner"
              >
                <a
                  href={item.url}
                  download={item.title}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

UnifiedMediaItem.displayName = 'UnifiedMediaItem';
