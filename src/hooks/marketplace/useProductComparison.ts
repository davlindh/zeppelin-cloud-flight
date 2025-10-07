
import { useState, useCallback } from 'react';
import type { Product } from '@/types/unified';

const MAX_COMPARISON_ITEMS = 4;

export const useProductComparison = () => {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);

  const addToComparison = useCallback((product: Product) => {
    setComparisonProducts(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev; // Already in comparison
      }
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        return [...prev.slice(1), product]; // Remove oldest, add new
      }
      return [...prev, product];
    });
  }, []);

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonProducts([]);
  }, []);

  const isInComparison = useCallback((productId: string) => {
    return comparisonProducts.some(p => p.id === productId);
  }, [comparisonProducts]);

  return {
    comparisonProducts,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore: comparisonProducts.length < MAX_COMPARISON_ITEMS
  };
};
