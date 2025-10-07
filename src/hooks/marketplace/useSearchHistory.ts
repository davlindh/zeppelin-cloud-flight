
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'search-history';
const MAX_SEARCHES = 10;

interface SearchHistoryItem {
  query: string;
  timestamp: string;
  resultCount?: number;
}

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSearchHistory(parsed);
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  // Save to localStorage whenever searchHistory changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, [searchHistory]);

  const addToSearchHistory = useCallback((query: string, resultCount?: number) => {
    if (!query.trim()) return;

    const item: SearchHistoryItem = {
      query: query.trim(),
      timestamp: new Date().toISOString(),
      resultCount
    };

    setSearchHistory(prev => {
      // Remove if already exists
      const filtered = prev.filter(s => s.query.toLowerCase() !== query.toLowerCase());
      // Add to beginning and limit to MAX_SEARCHES
      return [item, ...filtered].slice(0, MAX_SEARCHES);
    });
  }, []);

  const removeFromSearchHistory = useCallback((query: string) => {
    setSearchHistory(prev => prev.filter(s => s.query !== query));
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getRecentSearches = useCallback((limit: number = 5) => {
    return searchHistory.slice(0, limit).map(item => item.query);
  }, [searchHistory]);

  return {
    searchHistory,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    getRecentSearches
  };
};
