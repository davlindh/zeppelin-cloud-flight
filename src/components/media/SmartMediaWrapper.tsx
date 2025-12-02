// Smooth migration wrapper for Smart Gallery integration
// Allows gradual rollout with zero breaking changes

import React from 'react';
import { MediaGrid } from './shared/MediaGrid';
import { SmartMediaGallery } from './SmartMediaGallery';
import { useState } from 'react';

interface SmartMediaWrapperProps {
  // Original MediaGrid props for backwards compatibility
  media?: any;
  items?: any;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  onPreview?: (item: any) => void;
  onDownload?: (item: any) => void;
  showActions?: boolean;
  showCheckboxes?: boolean;
  compact?: boolean;
  showMetadata?: boolean;
  showStatus?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
  loading?: boolean;
  emptyMessage?: string;
  context?: "admin" | "public";

  // Smart Gallery enhancement
  useSmartGallery?: boolean;
  // Optional Smart Gallery features
  multiSelect?: boolean;
  containerHeight?: number;
  enableTouchGestures?: boolean;
}

/**
 * Wrapper component for smooth Smart Gallery integration
 *
 * USAGE EXAMPLES:
 *
 * // Traditional usage (keeps working exactly the same)
 * <SmartMediaWrapper items={items} onSelect={handleSelect} />
 *
 * // Enable Smart Gallery features
 * <SmartMediaWrapper
 *   items={items}
 *   onSelect={handleSelect}
 *   useSmartGallery={true}
 *   multiSelect={true}
 *   containerHeight={600}
 * />
 *
 * // Feature flag rollout
 * const USE_SMART_GALLERY = import.meta.env.VITE_USE_SMART_GALLERY === 'true';
 * <SmartMediaWrapper items={items} useSmartGallery={USE_SMART_GALLERY} />
 */
export const SmartMediaWrapper: React.FC<SmartMediaWrapperProps> = ({
  useSmartGallery = false,
  multiSelect,
  containerHeight,
  enableTouchGestures,
  // Original props
  ...mediaGridProps
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(mediaGridProps.selectedIds || new Set()));

  // Update selected IDs when props change
  React.useEffect(() => {
    setSelectedIds(new Set(mediaGridProps.selectedIds || new Set()));
  }, [mediaGridProps.selectedIds]);

  if (useSmartGallery) {
    // Transform MediaGrid props to Smart Gallery props
    const smartProps = {
      items: mediaGridProps.media || mediaGridProps.items || [],
      selectedIds,
      onSelectionChange: mediaGridProps.onSelect
        ? (id: string, selected: boolean) => {
            const newSelected = new Set(selectedIds);
            if (selected) {
              newSelected.add(id);
            } else {
              newSelected.delete(id);
            }
            setSelectedIds(newSelected);
            mediaGridProps.onSelect!(id);
          }
        : undefined,
      onItemClick: mediaGridProps.onPreview,
      multiSelect: multiSelect ?? !!mediaGridProps.showCheckboxes,
      containerHeight: containerHeight ?? 600,
      loading: mediaGridProps.loading,
      emptyMessage: mediaGridProps.emptyMessage,
      enableTouchGestures: enableTouchGestures ?? false,
      itemHeight: mediaGridProps.compact ? 150 : 200,
      gap: 16,
    };

    return <SmartMediaGallery {...smartProps} />;
  }

  // Fallback to original MediaGrid
  // Filter out Smart Gallery specific props that aren't compatible with MediaGrid
  const filteredProps = { ...mediaGridProps };
  delete (filteredProps as any).useSmartGallery;
  delete (filteredProps as any).multiSelect;
  delete (filteredProps as any).containerHeight;
  delete (filteredProps as any).enableTouchGestures;

  return (
    <MediaGrid
      {...filteredProps}
      selectedIds={selectedIds}
      onSelect={mediaGridProps.onSelect}
    />
  );
};
