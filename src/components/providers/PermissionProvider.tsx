import React, { createContext, useContext, useState, useEffect } from 'react';
import { CachePermissionDialog } from '@/components/ui/CachePermissionDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useCacheManager } from '@/hooks/useFileCache';

interface PermissionContextValue {
  showCachePermission: () => void;
  hasCacheConsent: boolean;
  requestPermission: (type: 'cache' | 'notifications' | 'location') => void;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [showCacheDialog, setShowCacheDialog] = useState(false);
  const [pendingCacheRequest, setPendingCacheRequest] = useState(false);
  
  const { 
    permissions, 
    requestNotificationPermission, 
    requestStoragePermission,
    requestGeolocationPermission 
  } = usePermissions();
  
  const { grantPermission, hasConsent } = useCacheManager();

  // Check if we should show permission dialog on first cache attempt
  useEffect(() => {
    if (pendingCacheRequest && !hasConsent) {
      setShowCacheDialog(true);
      setPendingCacheRequest(false);
    }
  }, [pendingCacheRequest, hasConsent]);

  const showCachePermission = () => {
    if (!hasConsent) {
      setShowCacheDialog(true);
    }
  };

  const requestPermission = async (type: 'cache' | 'notifications' | 'location') => {
    switch (type) {
      case 'cache':
        showCachePermission();
        break;
      case 'notifications':
        await requestNotificationPermission();
        break;
      case 'location':
        await requestGeolocationPermission();
        break;
    }
  };

  const handleCachePermissionGranted = async (settings: {
    enableCache: boolean;
    maxSize: number;
    allowBackground: boolean;
    allowCellular: boolean;
  }) => {
    // Request persistent storage if cache is enabled
    if (settings.enableCache) {
      await requestStoragePermission();
    }
    
    grantPermission(settings);
  };

  return (
    <PermissionContext.Provider
      value={{
        showCachePermission,
        hasCacheConsent: hasConsent,
        requestPermission
      }}
    >
      {children}
      
      <CachePermissionDialog
        open={showCacheDialog}
        onOpenChange={setShowCacheDialog}
        onPermissionGranted={handleCachePermissionGranted}
      />
    </PermissionContext.Provider>
  );
};