import { useState, useEffect, useCallback } from 'react';

export interface PermissionState {
  cache: 'granted' | 'denied' | 'prompt';
  notifications: 'granted' | 'denied' | 'prompt' | 'default';
  location: 'granted' | 'denied' | 'prompt';
  storage: 'granted' | 'denied' | 'prompt';
}

export interface StorageEstimate {
  quota?: number;
  usage?: number;
  usageDetails?: {
    indexedDB?: number;
    caches?: number;
    serviceWorker?: number;
  };
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionState>({
    cache: 'prompt',
    notifications: 'prompt', 
    location: 'prompt',
    storage: 'prompt'
  });

  const [storageInfo, setStorageInfo] = useState<StorageEstimate>({});
  const [isChecking, setIsChecking] = useState(false);

  // Check browser support for various APIs
  const hasPermissionsAPI = 'permissions' in navigator;
  const hasStorageAPI = 'storage' in navigator && 'estimate' in navigator.storage;
  const hasNotificationAPI = 'Notification' in window;
  const hasGeolocationAPI = 'geolocation' in navigator;

  const checkPermissions = useCallback(async () => {
    if (!hasPermissionsAPI) return;

    setIsChecking(true);
    
    try {
      const results = await Promise.allSettled([
        // Check storage permission (proxy for cache permission)
        navigator.permissions.query({ name: 'persistent-storage' as PermissionName }),
        // Check notification permission
        hasNotificationAPI ? Promise.resolve({ state: Notification.permission }) : null,
        // Check geolocation permission  
        hasGeolocationAPI ? navigator.permissions.query({ name: 'geolocation' }) : null
      ]);

      setPermissions(prev => ({
        ...prev,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        storage: results[0].status === 'fulfilled' ? (results[0].value as any).state : 'prompt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cache: results[0].status === 'fulfilled' ? (results[0].value as any).state : 'prompt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        notifications: results[1] ? ((results[1] as any).value?.state as 'granted' | 'denied' | 'prompt' | 'default') || 'prompt' : 'prompt',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        location: results[2]?.status === 'fulfilled' ? (results[2].value as any).state : 'prompt'
      }));
    } catch (error) {
      console.warn('Error checking permissions:', error);
    } finally {
      setIsChecking(false);
    }
  }, [hasPermissionsAPI, hasNotificationAPI, hasGeolocationAPI]);

  const checkStorageInfo = useCallback(async () => {
    if (!hasStorageAPI) return;

    try {
      const estimate = await navigator.storage.estimate();
      setStorageInfo(estimate);
    } catch (error) {
      console.warn('Error getting storage estimate:', error);
    }
  }, [hasStorageAPI]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!hasNotificationAPI) return 'denied';

    try {
      const permission = await Notification.requestPermission();
      setPermissions(prev => ({
        ...prev,
        notifications: permission
      }));
      return permission;
    } catch (error) {
      console.warn('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [hasNotificationAPI]);

  const requestStoragePermission = useCallback(async (): Promise<boolean> => {
    if (!hasStorageAPI) return false;

    try {
      const persistent = await navigator.storage.persist();
      setPermissions(prev => ({
        ...prev,
        storage: persistent ? 'granted' : 'denied',
        cache: persistent ? 'granted' : 'denied'
      }));
      return persistent;
    } catch (error) {
      console.warn('Error requesting persistent storage:', error);
      return false;
    }
  }, [hasStorageAPI]);

  const requestGeolocationPermission = useCallback(async (): Promise<boolean> => {
    if (!hasGeolocationAPI) return false;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions(prev => ({
            ...prev,
            location: 'granted'
          }));
          resolve(true);
        },
        (error) => {
          setPermissions(prev => ({
            ...prev,
            location: 'denied'
          }));
          resolve(false);
        },
        { timeout: 10000 }
      );
    });
  }, [hasGeolocationAPI]);

  const formatStorageSize = useCallback((bytes?: number): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }, []);

  const getStorageUsagePercent = useCallback((): number => {
    if (!storageInfo.quota || !storageInfo.usage) return 0;
    return (storageInfo.usage / storageInfo.quota) * 100;
  }, [storageInfo]);

  const getStorageRecommendation = useCallback((): {
    canUseCache: boolean;
    recommendedSize: number;
    warning?: string;
  } => {
    if (!storageInfo.quota) {
      return {
        canUseCache: true,
        recommendedSize: 100, // Conservative fallback
        warning: 'Kunde inte bestämma lagringsgräns'
      };
    }

    const totalGB = storageInfo.quota / (1024 * 1024 * 1024);
    const usagePercent = getStorageUsagePercent();

    if (usagePercent > 90) {
      return {
        canUseCache: false,
        recommendedSize: 0,
        warning: 'Lagringsutrymmet är nästan fullt'
      };
    }

    if (totalGB < 1) {
      return {
        canUseCache: true,
        recommendedSize: 50,
        warning: 'Begränsat lagringsutrymme tillgängligt'
      };
    }

    if (totalGB < 5) {
      return {
        canUseCache: true,
        recommendedSize: 250
      };
    }

    return {
      canUseCache: true,
      recommendedSize: 500
    };
  }, [storageInfo, getStorageUsagePercent]);

  useEffect(() => {
    checkPermissions();
    checkStorageInfo();
  }, [checkPermissions, checkStorageInfo]);

  return {
    permissions,
    storageInfo,
    isChecking,
    hasPermissionsAPI,
    hasStorageAPI,
    hasNotificationAPI,
    hasGeolocationAPI,
    requestNotificationPermission,
    requestStoragePermission,
    requestGeolocationPermission,
    checkPermissions,
    checkStorageInfo,
    formatStorageSize,
    getStorageUsagePercent,
    getStorageRecommendation
  };
};
