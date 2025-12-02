import React, {
  useState,
  useCallback,
  useRef,
  memo,
  useEffect
} from 'react';
import { cn } from '@/lib/utils';
import { MediaItem } from '@/types/unified-media';

interface AccessibleMediaItemProps {
  /** The media item */
  item: MediaItem;

  /** Children to render (image/content) */
  children: React.ReactNode;

  /** Whether item is selected */
  selected?: boolean;

  /** Show checkbox for selection */
  showCheckbox?: boolean;

  /** Click handlers */
  onClick?: () => void;
  onSelect?: (selected: boolean) => void;
  onPreview?: () => void;

  /** Keyboard navigation */
  allowKeyboardNavigation?: boolean;

  /** Custom class name */
  className?: string;
}

// Screen reader announcements
let announcementTimeout: NodeJS.Timeout;
const announceToScreenReader = (message: string) => {
  // Clear any existing announcement
  if (announcementTimeout) clearTimeout(announcementTimeout);

  // Create or update announcement element
  let announcer = document.getElementById('sr-media-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-media-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  // Announce the message
  announcer.textContent = message;

  // Clear after screen reader processes it
  announcementTimeout = setTimeout(() => {
    if (announcer) announcer.textContent = '';
  }, 1000);
};

export const AccessibleMediaItem: React.FC<AccessibleMediaItemProps> = memo(({
  item,
  children,
  selected = false,
  showCheckbox = false,
  onClick,
  onSelect,
  onPreview,
  allowKeyboardNavigation = true,
  className
}) => {
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  // Generate accessible description
  const getAccessibleDescription = useCallback(() => {
    const parts = [];

    // Media type
    if (item.type) parts.push(`${item.type} file`);

    // Title
    if (item.title) parts.push(`titled "${item.title}"`);

    // Category
    if (item.category) parts.push(`in ${item.category} category`);

    // Selection state
    if (selected) parts.push('selected');

    // Size
    if (item.size) {
      const sizeMB = Math.round((item.size / (1024 * 1024)) * 10) / 10;
      parts.push(`${sizeMB}MB`);
    }

    // Formatted date
    if (item.created_at) {
      const date = new Date(item.created_at);
      parts.push(`created ${date.toLocaleDateString()}`);
    }

    return parts.join(', ');
  }, [item, selected]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!allowKeyboardNavigation) return;

    let nextItem: HTMLElement | null = null;
    let prevItem: HTMLElement | null = null;
    let firstItem: HTMLElement | null = null;
    let lastItem: HTMLElement | null = null;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          // Control+Enter opens preview
          onPreview?.();
        } else {
          // Regular Enter/Space clicks/selects
          if (showCheckbox) {
            onSelect?.(!selected);
            announceToScreenReader(`${selected ? 'unselected' : 'selected'} ${item.title || 'media item'}`);
          } else {
            onClick?.();
          }
        }
        break;

      case 'p':
      case 'P':
        // 'P' key for preview
        event.preventDefault();
        onPreview?.();
        announceToScreenReader(`Previewing ${item.title || 'media item'}`);
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        // Move to next item
        event.preventDefault();
        nextItem = itemRef.current?.nextElementSibling?.nextElementSibling as HTMLElement;
        nextItem?.focus();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        // Move to previous item
        event.preventDefault();
        prevItem = itemRef.current?.previousElementSibling?.previousElementSibling as HTMLElement;
        prevItem?.focus();
        break;

      case 'Home':
        // Move to first item
        event.preventDefault();
        firstItem = itemRef.current?.parentElement?.firstElementChild as HTMLElement;
        firstItem?.focus();
        break;

      case 'End':
        // Move to last item
        event.preventDefault();
        lastItem = itemRef.current?.parentElement?.lastElementChild as HTMLElement;
        lastItem?.focus();
        break;
    }
  }, [allowKeyboardNavigation, showCheckbox, selected, item.title, onClick, onSelect, onPreview]);

  // Handle focus changes for visual feedback
  const handleFocus = useCallback(() => {
    setIsKeyboardFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsKeyboardFocused(false);
  }, []);

  // Announce selection changes
  useEffect(() => {
    if (selected) {
      announceToScreenReader(`Selected ${item.title || 'media item'}`);
    }
  }, [selected, item.title]);

  return (
    <div
      ref={itemRef}
      className={cn(
        "relative group",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isKeyboardFocused && "ring-2 ring-primary ring-offset-2",
        className
      )}
      role={showCheckbox ? "checkbox" : onClick ? "button" : "img"}
      aria-checked={showCheckbox ? selected : undefined}
      aria-label={getAccessibleDescription()}
      aria-describedby={`media-item-${item.id}-description`}
      tabIndex={allowKeyboardNavigation ? 0 : -1}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute top-2 left-2 z-10">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                onSelect?.(e.target.checked);
                announceToScreenReader(`${e.target.checked ? 'selected' : 'unselected'} ${item.title || 'item'}`);
              }}
              className="w-4 h-4 rounded border-2 border-white bg-black/20 backdrop-blur-sm
                         checked:bg-primary checked:border-primary
                         focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black"
              aria-label={`Select ${item.title || 'media item'}`}
            />
          </label>
        </div>
      )}

      {/* Selection Indicator */}
      {selected && !showCheckbox && (
        <div
          className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1"
          aria-hidden="true"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Main Content */}
      {children}

      {/* Hidden Description for Screen Readers */}
      <div
        id={`media-item-${item.id}-description`}
        className="sr-only"
      >
        {item.description && (
          <p>Description: {item.description}</p>
        )}
        {item.tags && item.tags.length > 0 && (
          <p>Tags: {item.tags.join(', ')}</p>
        )}
        {item.type === 'image' && (
          <p>This is an image file. Press Enter to view or Space to select.</p>
        )}
        {item.type === 'video' && (
          <p>This is a video file. Press Enter to play or P to preview.</p>
        )}
        {item.type === 'audio' && (
          <p>This is an audio file. Press Enter to play or P to preview.</p>
        )}
        {item.type === 'document' && (
          <p>This is a document file. Press Enter to view or Space to select.</p>
        )}
        <p>Use arrow keys to navigate between items. Press Home to go to first item, End to go to last item.</p>
        {showCheckbox && (
          <p>This item can be selected. Use Space or Enter to toggle selection.</p>
        )}
      </div>

      {/* Keyboard Navigation Indicators (visible in high contrast mode) */}
      {isKeyboardFocused && (
        <div
          className="absolute inset-0 border-2 border-dashed border-primary pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

AccessibleMediaItem.displayName = 'AccessibleMediaItem';
