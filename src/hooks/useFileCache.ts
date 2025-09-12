import { useState, useEffect, useCallback } from 'react';
import { fileCacheService, type CacheEntry, type CacheSettings } from '@/services/FileCacheService';

export interface UseCachedFileResult {
  cachedUrl: string | null;
  isLoading: boolean;
  isCached: boolean;
  error: string | null;
  cacheFile: () => Promise<void>;
  removeCachedFile: () => Promise<void>;
}

export const useCachedFile = (url: string, metadata?: CacheEntry['metadata']): UseCachedFileResult => {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCache = useCallback(async () => {
    if (!url) return;

    try {
      const cached = await fileCacheService.getCachedFile(url);
      if (cached) {
        const blobUrl = URL.createObjectURL(cached.blob);
        setCachedUrl(blobUrl);
        setIsCached(true);
      } else {
        setCachedUrl(null);
        setIsCached(false);
      }
    } catch (err) {
      console.warn('Error checking cache:', err);
      setError(err instanceof Error ? err.message : 'Cache check failed');
    }
  }, [url]);

  const cacheFile = useCallback(async () => {
    if (!url || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const cached = await fileCacheService.cacheFile(url, metadata);
      if (cached) {
        const blobUrl = URL.createObjectURL(cached.blob);
        setCachedUrl(blobUrl);
        setIsCached(true);
      }
    } catch (err) {
      console.warn('Error caching file:', err);
      setError(err instanceof Error ? err.message : 'Caching failed');
    } finally {
      setIsLoading(false);
    }
  }, [url, metadata, isLoading]);

  const removeCachedFile = useCallback(async () => {
    if (!url) return;

    try {
      await fileCacheService.removeCachedFile(url);
      if (cachedUrl) {
        URL.revokeObjectURL(cachedUrl);
      }
      setCachedUrl(null);
      setIsCached(false);
    } catch (err) {
      console.warn('Error removing cached file:', err);
      setError(err instanceof Error ? err.message : 'Remove failed');
    }
  }, [url, cachedUrl]);

  useEffect(() => {
    checkCache();
    
    // Cleanup blob URL on unmount
    return () => {
      if (cachedUrl) {
        URL.revokeObjectURL(cachedUrl);
      }
    };
  }, [checkCache]);

  return {
    cachedUrl,
    isLoading,
    isCached,
    error,
    cacheFile,
    removeCachedFile
  };
};

export interface UseCacheManagerResult {
  settings: CacheSettings;
  stats: {
    totalFiles: number;
    totalSize: number;
    sizeFormatted: string;
    maxSizeMB: number;
    usagePercent: number;
  };
  isLoading: boolean;
  updateSettings: (newSettings: Partial<CacheSettings>) => void;
  clearCache: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useCacheManager = (): UseCacheManagerResult => {
  const [settings, setSettings] = useState<CacheSettings>(fileCacheService.getSettings());
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    sizeFormatted: '0 B',
    maxSizeMB: 500,
    usagePercent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    try {
      const newStats = await fileCacheService.getCacheStats();
      setStats(newStats);
    } catch (error) {
      console.warn('Failed to refresh cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<CacheSettings>) => {
    fileCacheService.updateSettings(newSettings);
    const updatedSettings = fileCacheService.getSettings();
    setSettings(updatedSettings);
  }, []);

  const clearCache = useCallback(async () => {
    setIsLoading(true);
    try {
      await fileCacheService.clearCache();
      await refreshStats();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    settings,
    stats,
    isLoading,
    updateSettings,
    clearCache,
    refreshStats
  };
};