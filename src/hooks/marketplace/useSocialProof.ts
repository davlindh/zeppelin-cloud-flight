
import { useState, useEffect, useCallback, useRef } from 'react';

interface ViewData {
  today: number;
  total: number;
  recentViewers: number;
  lastUpdated: string;
}

interface SocialProofData {
  views: ViewData;
  isLoading: boolean;
  recordView: () => void;
  getActivityMessage: () => string;
}

export const useSocialProof = (itemId: string, itemType: 'auction' | 'product' | 'service'): SocialProofData => {
  const [views, setViews] = useState<ViewData>({
    today: 0,
    total: 0,
    recentViewers: 0,
    lastUpdated: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const lastRecordedRef = useRef<number>(0);

  const storageKey = `views_${itemType}_${itemId}`;
  const sessionKey = `session_viewed_${itemType}_${itemId}`;
  const todayKey = new Date().toDateString();

  useEffect(() => {
    loadViewData();
  }, [itemId]);

  const loadViewData = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Check if the data is from a previous day and reset today's count
        const lastViewDate = new Date(data.lastUpdated).toDateString();
        if (lastViewDate !== todayKey) {
          const resetData = {
            ...data,
            today: 0,
            lastUpdated: new Date().toISOString()
          };
          setViews(resetData);
          localStorage.setItem(storageKey, JSON.stringify(resetData));
        } else {
          setViews(data);
        }
      }
      
    } catch (error) {
      console.warn('Failed to load view data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recordView = useCallback(() => {
    try {
      const now = Date.now();
      
      // Debouncing: prevent recording if called within 1 second
      if (now - lastRecordedRef.current < 1000) {
        console.log('🚫 View recording debounced');
        return;
      }

      // Session-based deduplication: check if already viewed in this session
      const alreadyViewedInSession = sessionStorage.getItem(sessionKey);
      if (alreadyViewedInSession) {
        console.log('✅ Already recorded view in this session');
        return;
      }

      const stored = localStorage.getItem(storageKey);
      let currentViews = views;
      
      if (stored) {
        currentViews = JSON.parse(stored);
      }

      // Check if we need to reset for a new day
      const lastViewDate = new Date(currentViews.lastUpdated).toDateString();
      const isNewDay = lastViewDate !== todayKey;
      
      const updatedViews = {
        today: isNewDay ? 1 : currentViews.today + 1,
        total: currentViews.total + 1,
        recentViewers: 0,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(updatedViews));
      sessionStorage.setItem(sessionKey, 'true');
      setViews(updatedViews);
      lastRecordedRef.current = now;
      
      console.log(`📊 View recorded for ${itemType} ${itemId}:`, updatedViews);
      
    } catch (error) {
      console.warn('Failed to record view:', error);
    }
  }, [itemId, itemType, storageKey, sessionKey, todayKey, views]);

  const getActivityMessage = (): string => {
    if (views.recentViewers === 0) return '';
    
    if (views.recentViewers === 1) {
      return '1 person viewed this recently';
    } else if (views.recentViewers <= 5) {
      return `${views.recentViewers} people viewed this recently`;
    } else {
      return `${views.recentViewers}+ people are viewing this`;
    }
  };

  return {
    views,
    isLoading,
    recordView,
    getActivityMessage
  };
};
