import { useEffect, useRef, useState } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  enabled?: boolean;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enabled = true
}: SwipeGestureOptions = {}) => {
  const [swipeDistance, setSwipeDistance] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  
  const startPos = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      startPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startPos.current.x;
      const deltaY = currentY - startPos.current.y;

      setSwipeDistance({ x: deltaX, y: deltaY });
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;

      const absX = Math.abs(swipeDistance.x);
      const absY = Math.abs(swipeDistance.y);

      // Determine if horizontal or vertical swipe
      if (absX > absY && absX > threshold) {
        // Horizontal swipe
        if (swipeDistance.x > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else if (absY > absX && absY > threshold) {
        // Vertical swipe
        if (swipeDistance.y > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }

      setIsSwiping(false);
      setSwipeDistance({ x: 0, y: 0 });
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isSwiping, swipeDistance, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    elementRef,
    isSwiping,
    swipeDistance,
    direction: getSwipeDirection(swipeDistance, threshold)
  };
};

function getSwipeDirection(
  distance: { x: number; y: number },
  threshold: number
): SwipeDirection {
  const absX = Math.abs(distance.x);
  const absY = Math.abs(distance.y);

  if (absX < threshold && absY < threshold) return null;

  if (absX > absY) {
    return distance.x > 0 ? 'right' : 'left';
  } else {
    return distance.y > 0 ? 'down' : 'up';
  }
}
