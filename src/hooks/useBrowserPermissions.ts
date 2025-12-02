import { useState, useEffect } from 'react';

interface BrowserPermissions {
  notifications: PermissionState | 'unknown';
  storage: boolean;
  geolocation: PermissionState | 'unknown';
}

export const useBrowserPermissions = () => {
  const [permissions, setPermissions] = useState<BrowserPermissions>({
    notifications: 'unknown',
    storage: false,
    geolocation: 'unknown'
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const newPermissions: BrowserPermissions = {
      notifications: 'unknown',
      storage: false,
      geolocation: 'unknown'
    };

    // Check notification permission
    if ('Notification' in window) {
      newPermissions.notifications = Notification.permission as PermissionState;
    }

    // Check storage permission (persistent storage)
    if ('storage' in navigator && 'persisted' in navigator.storage) {
      try {
        const persisted = await navigator.storage.persisted();
        newPermissions.storage = persisted;
      } catch (error) {
        console.error('Error checking storage permission:', error);
      }
    }

    // Check geolocation permission
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        newPermissions.geolocation = result.state;
      } catch (error) {
        console.error('Error checking geolocation permission:', error);
      }
    }

    setPermissions(newPermissions);
  };

  const requestNotificationPermission = async (): Promise<PermissionState> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setPermissions(prev => ({ ...prev, notifications: permission as PermissionState }));
    return permission as PermissionState;
  };

  const requestStoragePermission = async (): Promise<boolean> => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const persisted = await navigator.storage.persist();
        setPermissions(prev => ({ ...prev, storage: persisted }));
        return persisted;
      } catch (error) {
        console.error('Error requesting storage permission:', error);
        return false;
      }
    }
    return false;
  };

  const requestGeolocationPermission = async (): Promise<PermissionState> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissions(prev => ({ ...prev, geolocation: 'granted' }));
          resolve('granted');
        },
        () => {
          setPermissions(prev => ({ ...prev, geolocation: 'denied' }));
          resolve('denied');
        }
      );
    });
  };

  return {
    permissions,
    requestNotificationPermission,
    requestStoragePermission,
    requestGeolocationPermission,
    checkPermissions
  };
};
