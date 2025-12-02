import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  memo
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaItem } from '@/types/unified-media';
import { cn } from '@/lib/utils';

// Local imports
import {
  useVirtualizedGallery,
  useSmartBulkOperations
} from '@/hooks/useVirtualizedGallery';
import { ProgressiveImage } from './shared/ProgressiveImage';
import { AccessibleMediaItem } from './shared/AccessibleMediaItem';
import { ContextualActionBar } from './shared/ContextualActionBar';
import { TouchGestureHandler } from './shared/TouchGestureHandler';

interface SmartMediaGalleryProps {
  /** Array of media items to display */
  items: MediaItem[];

  /** Selected item IDs */
  selectedIds?: Set<string>;

  /** Callback when selection changes */
  onSelectionChange?: (id: string, selected: boolean) => void;

  /** Callback when item is clicked */
  onItemClick?: (item: MediaItem) => void;

  /** Callback when item preview is requested */
  onItemPreview?: (item: MediaItem) => void;

  /** Callback when bulk action is executed */
  onBulkAction?: (action: string, items: MediaItem[]) => void;

  /** Enable multi-select mode */
  multiSelect?: boolean;

  /** Container height for virtualization */
  containerHeight?: number;

  /** Item height (used for virtualization) */
  itemHeight?: number;

  /** Grid gap */
  gap?: number;

  /** Enable touch gestures for mobile */
  enableTouchGestures?: boolean;

  /** Enable infinite scroll */
  infiniteScroll?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Empty state message */
  emptyMessage?: string;

  /** Custom class name */
  className?: string;
}

// Memoized media item component for performance
const VirtualizedMediaItem = memo<{
  item: MediaItem;
  isSelected: boolean;
  onClick: () => void;
  onSelect: (selected: boolean) => void;
  onPreview: () => void;
  itemHeight: number;
  showSelection: boolean;
  index: number;
}>(({ item, isSelected, onClick, onSelect, onPreview, itemHeight, showSelection, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: Math.min(index * 0.02, 0.3), // Stagger animation, max 0.3s delay
        duration: 0.2
      }}
      className={cn(
        "relative rounded-lg overflow-hidden bg-background border",
        isSelected && "ring-2 ring-primary ring-offset-2",
        "hover:shadow-lg transition-shadow duration-200"
      )}
      style={{ height: itemHeight }}
    >
      <AccessibleMediaItem
        item={item}
        selected={isSelected}
        onClick={onClick}
        onSelect={onSelect}
        onPreview={onPreview}
        showCheckbox={showSelection}
      >
        <ProgressiveImage
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover cursor-pointer"
          thumbnail={item.thumbnail}
          onClick={onClick}
        />
      </AccessibleMediaItem>
    </motion.div>
  );
});

VirtualizedMediaItem.displayName = 'VirtualizedMediaItem';

export const SmartMediaGallery: React.FC<SmartMediaGalleryProps> = ({
  items,
  selectedIds = new Set(),
  onSelectionChange,
  onItemClick,
  onItemPreview,
  onBulkAction,
  multiSelect = false,
  containerHeight = 600,
  itemHeight = 200,
  gap = 16,
  enableTouchGestures = true,
  infiniteScroll = false,
  loading = false,
  emptyMessage = "No media files found",
  className
}) => {
  // State for viewport dimensions
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Update viewport width on resize
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Virtualization hook
  const {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll,
    containerRef
  } = useVirtualizedGallery({
    items,
    itemHeight,
    containerHeight,
    viewportWidth,
    gap,
    overscan: 2
  });

  // Bulk operations hook
  const { suggestedActions, executeAction } = useSmartBulkOperations(selectedIds, items);

  // Handlers
  const handleItemClick = useCallback((item: MediaItem) => {
    if (multiSelect && onSelectionChange) {
      const isSelected = selectedIds.has(item.id);
      onSelectionChange(item.id, !isSelected);
    } else {
      onItemClick?.(item);
    }
  }, [multiSelect, onSelectionChange, selectedIds, onItemClick]);

  const handleItemSelect = useCallback((id: string, selected: boolean) => {
    onSelectionChange?.(id, selected);
  }, [onSelectionChange]);

  const handleItemPreview = useCallback((item: MediaItem) => {
    onItemPreview?.(item);
  }, [onItemPreview]);

  const handleBulkAction = useCallback(async (actionKey: string) => {
    const selectedItems = items.filter(item => selectedIds.has(item.id));
    await executeAction(actionKey);
    onBulkAction?.(actionKey, selectedItems);
  }, [items, selectedIds, executeAction, onBulkAction]);

  // Touch gesture handlers
  const touchHandlers = useMemo(() => ({
    onSwipeLeft: () => {
      // Navigate to next item or page
      console.log('Swipe left - next');
    },
    onSwipeRight: () => {
      // Navigate to previous item or page
      console.log('Swipe right - previous');
    },
    onPinchStart: (scale: number) => {
      // Handle zoom or view mode change
      console.log('Pinch start:', scale);
    },
    onPinchEnd: (scale: number) => {
      // Confirm zoom level
      console.log('Pinch end:', scale);
    }
  }), []);

  // Loading state
  if (loading) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height: containerHeight }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">Loading media...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div
        className={cn("flex flex-col items-center justify-center text-center p-8", className)}
        style={{ height: containerHeight }}
      >
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-lg font-semibold mb-2">No media found</h3>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={galleryRef}>
      {/* Contextual Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && suggestedActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 z-20 mb-4"
          >
            <ContextualActionBar
              selectedCount={selectedIds.size}
              actions={suggestedActions}
              onAction={handleBulkAction}
              onClearSelection={() => selectedIds.clear()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtualized Gallery Container */}
      <TouchGestureHandler
        enabled={enableTouchGestures}
        {...touchHandlers}
      >
        <div
          ref={containerRef}
          className="overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          style={{ height: containerHeight }}
          onScroll={onScroll}
          role="main"
          aria-label={`Media gallery with ${items.length} items`}
        >
          <div
            className="relative"
            style={{ height: totalHeight }}
          >
            {/* Visible Items Container */}
            <div
              className="absolute inset-x-0 grid gap-4 p-4"
              style={{
                top: offsetY,
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'
              }}
            >
              <AnimatePresence mode="popLayout">
                {visibleItems.map((item, index) => {
                  const globalIndex = items.indexOf(item);
                  const actualIndex = globalIndex - Math.floor((globalIndex + 6 - (globalIndex % 6)) / 6) * 6 + index;

                  return (
                    <VirtualizedMediaItem
                      key={`media-item-${item.id}`}
                      item={item}
                      isSelected={selectedIds.has(item.id)}
                      onClick={() => handleItemClick(item)}
                      onSelect={(selected) => handleItemSelect(item.id, selected)}
                      onPreview={() => handleItemPreview(item)}
                      itemHeight={itemHeight}
                      showSelection={multiSelect}
                      index={actualIndex}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </TouchGestureHandler>

      {/* Performance Info (Dev mode only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded font-mono">
          Gallery: {items.length} total | {visibleItems.length} visible | {selectedIds.size} selected
        </div>
      )}
    </div>
  );
};
