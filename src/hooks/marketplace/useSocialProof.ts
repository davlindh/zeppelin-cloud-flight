
import { useState, useEffect } from 'react';

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

  const storageKey = `views_${itemType}_${itemId}`;
  const todayKey = new Date().toDateString();

  useEffect(() => {
    loadViewData();
  }, [itemId]);

  const loadViewData = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        setViews(data);
      }
      
      // No fake viewers - recentViewers will remain 0
      
    } catch (error) {
      console.warn('Failed to load view data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recordView = () => {
    try {
      const now = new Date();
      const stored = localStorage.getItem(storageKey);
      let currentViews = views;
      
      if (stored) {
        currentViews = JSON.parse(stored);
      }

      // Check if we've already recorded a view today
      const lastViewDate = new Date(currentViews.lastUpdated).toDateString();
      const isNewDayView = lastViewDate !== todayKey;
      
      const updatedViews = {
        today: isNewDayView ? 1 : currentViews.today + 1,
        total: currentViews.total + 1,
        recentViewers: 0, // No fake viewers
        lastUpdated: now.toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(updatedViews));
      setViews(updatedViews);
      
      console.log(`📊 View recorded for ${itemType} ${itemId}:`, updatedViews);
      
    } catch (error) {
      console.warn('Failed to record view:', error);
    }
  };

  const getActivityMessage = (): string => {
    if (views.recentViewers === 0) return ';
    
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
