import { useState, useEffect, useCallback, useRef } from 'react';

interface UseScrollDetectionOptions {
  threshold?: number;
  throttleMs?: number;
}

export const useScrollDetection = ({ 
  threshold = 50,
  throttleMs = 100 
}: UseScrollDetectionOptions = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const lastRan = useRef(Date.now());

  const handleScroll = useCallback(() => {
    const now = Date.now();
    
    if (now - lastRan.current >= throttleMs) {
      setIsScrolled(window.scrollY > threshold);
      lastRan.current = now;
    }
  }, [threshold, throttleMs]);

  useEffect(() => {
    // Check initial state
    handleScroll();

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return isScrolled;
};
