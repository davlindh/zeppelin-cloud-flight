import { useState, useEffect } from 'react';

// Browser permissions hook - handles notification and geolocation permissions
const isSupported = (name: string) => 'permissions' in navigator && navigator.permissions.query;

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    notifications: 'prompt' as PermissionState,
    geolocation: 'prompt' as PermissionState,
  });

  // Check current permission states
  useEffect(() => {
    if (!isSupported('permissions')) return;

    const checkPermissions = async () => {
      try {
        const [notificationPerm, geolocationPerm] = await Promise.all([
          navigator.permissions.query({ name: 'notifications' }).catch(() => ({ state: 'denied' as PermissionState })),
          navigator.permissions.query({ name: 'geolocation' }).catch(() => ({ state: 'denied' as PermissionState })),
        ]);

        setPermissions({
          notifications: notificationPerm.state,
          geolocation: geolocationPerm.state,
        });
      } catch (error) {
        console.warn('Error checking permissions:', error);
      }
    };

    checkPermissions();
  }, []);

  const requestNotificationPermission = async (): Promise<PermissionState> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      const permissionState: PermissionState = result === 'default' ? 'prompt' : result;
      setPermissions(prev => ({ ...prev, notifications: permissionState }));
      return permissionState;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };

  const requestGeolocationPermission = async (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        console.warn('Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissions(prev => ({ ...prev, geolocation: 'granted' }));
          resolve(position);
        },
        (error) => {
          console.warn('Geolocation permission denied:', error);
          setPermissions(prev => ({ ...prev, geolocation: 'denied' }));
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  };

  function requestStoragePermission(): Promise<boolean> {
    if (!('storage' in navigator && 'persist' in navigator.storage)) {
      console.warn('Storage persistence not supported');
      return Promise.resolve(false);
    }

    try {
      return navigator.storage.persist().then(isPersisted => {
        console.log('Storage persistence:', isPersisted ? 'granted' : 'denied');
        return isPersisted;
      });
    } catch (error) {
      console.warn('Error requesting storage permission:', error);
      return Promise.resolve(false);
    }
  }

  return {
    permissions,
    requestNotificationPermission,
    requestStoragePermission,
    requestGeolocationPermission,
  };
};
