import React, {
  useRef,
  useCallback,
  useEffect,
  ReactNode
} from 'react';

interface TouchGestureHandlerProps {
  /** Children to render */
  children: ReactNode;

  /** Enable touch gestures */
  enabled?: boolean;

  /** Swipe handlers */
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;

  /** Pinch/zoom handlers */
  onPinchStart?: (scale: number) => void;
  onPinchEnd?: (scale: number) => void;

  /** Tap handlers */
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;

  /** Gesture configuration */
  swipeThreshold?: number;
  longPressDelay?: number;

  /** Custom class name */
  className?: string;
}

export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  children,
  enabled = true,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchStart,
  onPinchEnd,
  onSingleTap,
  onDoubleTap,
  onLongPress,
  swipeThreshold = 50,
  longPressDelay = 500,
  className
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number; pinchActive?: boolean } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    const now = Date.now();

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };

    // Start long press timer
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      onLongPress?.();
    }, longPressDelay);

    // Track taps for double tap detection
    if (now - lastTapTimeRef.current < 300) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;
  }, [enabled, onLongPress, longPressDelay, clearLongPressTimer]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    clearLongPressTimer();

    const touch = e.changedTouches[0];
    const now = Date.now();

    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Detect swipe gestures
    if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    } else if (deltaTime < 300) {
      // Tap gestures
      if (tapCountRef.current === 2) {
        onDoubleTap?.();
        tapCountRef.current = 0;
      } else {
        // Delay single tap to allow double tap detection
        setTimeout(() => {
          if (tapCountRef.current === 1) {
            onSingleTap?.();
            tapCountRef.current = 0;
          }
        }, 300);
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [enabled, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSingleTap, onDoubleTap, clearLongPressTimer]);

  // Handle touch move (cancel long press)
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    clearLongPressTimer();

    // Detect pinch gestures
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // Calculate pinch scale (this is a simple implementation)
      const scale = distance / 100; // Normalize

      if (onPinchStart && !touchStartRef.current?.pinchActive) {
        onPinchStart(scale);
        if (touchStartRef.current) {
          touchStartRef.current.pinchActive = true;
        }
      }
    }
  }, [enabled, onPinchStart, clearLongPressTimer]);

  // Handle pinch end
  const handleTouchCancel = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    clearLongPressTimer();

    if (onPinchEnd) {
      onPinchEnd(1); // Reset scale
    }

    if (touchStartRef.current) {
      touchStartRef.current.pinchActive = false;
    }
  }, [enabled, onPinchEnd, clearLongPressTimer]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchcancel', handleTouchCancel);
      clearLongPressTimer();
    };
  }, [enabled, handleTouchStart, handleTouchEnd, handleTouchMove, handleTouchCancel, clearLongPressTimer]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        touchAction: enabled ? 'manipulation' : 'auto',
        // Prevent text selection and callouts on iOS
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};
