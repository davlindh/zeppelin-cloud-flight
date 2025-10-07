
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { transformDatabaseNotificationPrefs, transformNotificationPrefsToDatabase } from '@/utils/marketplace/transforms/database';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  priceDropAlerts: boolean;
  stockAlerts: boolean;
  backInStockAlerts: boolean;
  auctionEndingAlerts: boolean;
  outbidAlerts: boolean;
  newItemsInCategories: boolean;
  dailyDigest: boolean;
  weeklyRecommendations: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  frequency: {
    immediate: boolean;
    hourly: boolean;
    daily: boolean;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: false,
  priceDropAlerts: true,
  stockAlerts: true,
  backInStockAlerts: true,
  auctionEndingAlerts: true,
  outbidAlerts: true,
  newItemsInCategories: false,
  dailyDigest: false,
  weeklyRecommendations: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  frequency: {
    immediate: true,
    hourly: false,
    daily: false
  }
};

const STORAGE_KEY = 'notification-preferences';

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useUserProfile();

  // Load preferences from Supabase or localStorage
  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      try {
        if (isAuthenticated && user?.id) {
          // Load from Supabase for authenticated users
          const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.warn('Failed to load notification preferences from Supabase:', error);
          }

          if (data) {
            setPreferences(transformDatabaseNotificationPrefs(data));
          } else {
            // Create default preferences for new users
            await createDefaultPreferences();
          }
        } else {
          // Load from localStorage for guests
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
          }
        }
      } catch (error) {
        console.warn('Failed to load notification preferences:', error);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    loadPreferences();
  }, [isAuthenticated, user?.id]);

  // Save preferences to localStorage for guests
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.warn('Failed to save notification preferences to localStorage:', error);
      }
    }
  }, [preferences, isLoaded, isAuthenticated]);

  const createDefaultPreferences = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          ...transformNotificationPrefsToDatabase(DEFAULT_PREFERENCES)
        });

      if (error) {
        console.warn('Failed to create default notification preferences:', error);
      }
    } catch (error) {
      console.warn('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    // Save to Supabase for authenticated users
    if (isAuthenticated && user?.id) {
      try {
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({
            user_id: user.id,
            ...transformNotificationPrefsToDatabase(newPreferences)
          });

        if (error) {
          console.warn('Failed to save notification preferences to Supabase:', error);
          // Revert local state on error
          setPreferences(preferences);
        }
      } catch (error) {
        console.warn('Error saving notification preferences:', error);
        setPreferences(preferences);
      }
    }
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const isQuietTime = (): boolean => {
    if (!preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { start, end } = preferences.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime <= end;
    }
  };

  return {
    preferences,
    updatePreferences,
    resetToDefaults,
    isLoaded,
    loading,
    isQuietTime
  };
};
