import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopOptions {
  /**
   * Enable/disable automatic scroll on route change
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Scroll behavior ('auto' or 'smooth')
   * @default 'smooth'
   */
  behavior?: ScrollBehavior;
  
  /**
   * Delay before scrolling (ms)
   * Useful if you need to wait for content to render
   * @default 0
   */
  delay?: number;

  /**
   * Only scroll if scrolled past this threshold (px)
   * @default 100
   */
  threshold?: number;

  /**
   * Whether to ignore hash changes (anchor links like #section)
   * @default true
   */
  ignoreHash?: boolean;
}

/**
 * Automatically scroll to top when route changes
 * 
 * @example
 * // In App.tsx or layout component
 * useScrollToTop();
 * 
 * @example
 * // With custom options
 * useScrollToTop({ behavior: 'auto', threshold: 200 });
 */
export const useScrollToTop = (options: ScrollToTopOptions = {}) => {
  const {
    enabled = true,
    behavior = 'smooth',
    delay = 0,
    threshold = 100,
    ignoreHash = true
  } = options;

  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;

    // Don't scroll for hash changes (anchor links)
    if (ignoreHash && location.hash) {
      return;
    }

    const scrollToTop = () => {
      // Only scroll if we're past the threshold
      if (window.pageYOffset > threshold) {
        window.scrollTo({
          top: 0,
          behavior
        });
      }
    };

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [location.pathname, location.search, enabled, behavior, delay, threshold, ignoreHash, location.hash]);
};
