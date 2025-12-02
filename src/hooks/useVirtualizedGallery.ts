import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MediaItem } from '@/types/unified-media';

interface VirtualizedGalleryOptions {
  items: MediaItem[];
  itemHeight: number;
  containerHeight: number;
  viewportWidth: number;
  gap: number;
  overscan?: number;
}

interface VirtualizedGalleryResult {
  visibleItems: MediaItem[];
  totalHeight: number;
  offsetY: number;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for virtualizing large galleries to improve performance
 * Only renders visible items to handle thousands of media items
 */
export const useVirtualizedGallery = ({
  items,
  itemHeight,
  containerHeight,
  viewportWidth,
  gap = 16,
  overscan = 5
}: VirtualizedGalleryOptions): VirtualizedGalleryResult => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive grid layout
  const gridLayout = useMemo(() => {
    const breakpoints = {
      mobile: { min: 0, cols: 2 },
      tablet: { min: 768, cols: 3 },
      desktop: { min: 1024, cols: 4 },
      wide: { min: 1280, cols: 5 },
      ultra: { min: 1536, cols: 6 }
    };

    let columns = 2;
    for (const bp of Object.values(breakpoints)) {
      if (viewportWidth >= bp.min) {
        columns = bp.cols;
      } else break;
    }

    return {
      columns,
      columnWidth: (viewportWidth - ((columns - 1) * gap)) / columns,
      rows: Math.ceil(items.length / columns)
    };
  }, [viewportWidth, gap, items.length]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const rowHeight = itemHeight + gap;
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      gridLayout.rows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    return {
      startItem: startRow * gridLayout.columns,
      endItem: Math.min(items.length - 1, (endRow + 1) * gridLayout.columns - 1),
      startRow,
      endRow
    };
  }, [scrollTop, containerHeight, itemHeight, gap, overscan, gridLayout, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startItem, endItem } = visibleRange;
    return items.slice(startItem, endItem + 1);
  }, [items, visibleRange]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return (gridLayout.rows * (itemHeight + gap)) - gap; // Subtract last gap
  }, [gridLayout.rows, itemHeight, gap]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => {
    const rowHeight = itemHeight + gap;
    return visibleRange.startRow * rowHeight;
  }, [visibleRange.startRow, itemHeight, gap]);

  // Scroll handler
  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll,
    containerRef
  };
};

/**
 * Hook for infinite scrolling with automatic loading
 */
export const useInfiniteGallery = (
  fetchItems: (offset: number, limit: number) => Promise<MediaItem[]>,
  initialLimit = 50,
  loadMoreThreshold = 0.8
) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await fetchItems(offsetRef.current, initialLimit);

      if (newItems.length < initialLimit) {
        setHasMore(false);
      }

      setItems(prev => [...prev, ...newItems]);
      offsetRef.current += newItems.length;
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, initialLimit, isLoading, hasMore]);

  // Check if we should load more based on scroll position
  const shouldLoadMore = useCallback(
    (visibleItemCount: number, totalItemCount: number) => {
      const scrollRatio = visibleItemCount / totalItemCount;
      return scrollRatio > loadMoreThreshold && hasMore && !isLoading;
    },
    [loadMoreThreshold, hasMore, isLoading]
  );

  return {
    items,
    isLoading,
    hasMore,
    loadMore,
    shouldLoadMore
  };
};

/**
 * Hook for intelligent bulk operations
 */
export const useSmartBulkOperations = (selectedIds: Set<string>, allItems: MediaItem[]) => {
  const selectedItems = useMemo(() => {
    return allItems.filter(item => selectedIds.has(item.id));
  }, [selectedIds, allItems]);

  // Intelligent action suggestions based on selected items
  const suggestedActions = useMemo(() => {
    if (selectedItems.length === 0) return [];

    const types = [...new Set(selectedItems.map(item => item.type))];
    const categories = [...new Set(selectedItems.map(item => item.category || 'general'))];

    const actions: Array<{ key: string; label: string; enabled: boolean }> = [];

    // Download - always available
    actions.push({
      key: 'download',
      label: `Download ${selectedItems.length} file${selectedItems.length > 1 ? 's' : ''}`,
      enabled: true
    });

    // Delete - always available for admin
    actions.push({
      key: 'delete',
      label: `Delete ${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''}`,
      enabled: true
    });

    // Bulk tagging - if multiple items
    if (selectedItems.length > 1) {
      actions.push({
        key: 'bulk-tag',
        label: 'Add tags to all selected',
        enabled: true
      });
    }

    // Format conversion - if all same format or mixed
    if (types.length === 1) {
      actions.push({
        key: 'convert',
        label: `Convert ${types[0]} files`,
        enabled: true
      });
    }

    // Category assignment - if no unified category
    if (categories.length > 1) {
      actions.push({
        key: 'bulk-categorize',
        label: 'Move to category',
        enabled: true
      });
    }

    return actions;
  }, [selectedItems]);

  const executeAction = useCallback(async (actionKey: string) => {
    // Implementation for each action would go here
    console.log(`Executing ${actionKey} on ${selectedItems.length} items`);
  }, [selectedItems.length]);

  return {
    selectedItems,
    suggestedActions,
    executeAction
  };
};
