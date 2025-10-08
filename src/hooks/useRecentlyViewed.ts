
import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types/unified';
import { getImageUrl } from '@/utils/imageUtils';

const STORAGE_KEY = 'recently-viewed-products';
const MAX_ITEMS = 10;

interface RecentlyViewedItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  viewedAt: string;
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.warn('Failed to load recently viewed products:', error);
    }
  }, []);

  // Save to localStorage whenever recentlyViewed changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (error) {
      console.warn('Failed to save recently viewed products:', error);
    }
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    const item: RecentlyViewedItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: getImageUrl(product.image),
      category: product.categoryName,
      viewedAt: new Date().toISOString()
    };

    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      // Add to beginning and limit to MAX_ITEMS
      return [item, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  };
};
