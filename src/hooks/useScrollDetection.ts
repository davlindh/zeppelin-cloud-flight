import { useState, useEffect } from 'react';

interface UseScrollDetectionOptions {
  threshold?: number;
}

export const useScrollDetection = ({ threshold = 50 }: UseScrollDetectionOptions = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Check initial state
    handleScroll();

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
};
