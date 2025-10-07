
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchListContextType {
  watchedAuctions: Set<number>;
  isWatching: (auctionId: number) => boolean;
  toggleWatch: (auctionId: number) => void;
  watchCount: number;
}

const WatchListContext = createContext<WatchListContextType | undefined>(undefined);

export const WatchListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchedAuctions, setWatchedAuctions] = useState<Set<number>>(new Set());

  // Load watched auctions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('watchedAuctions');
    if (saved) {
      try {
        const auctionIds = JSON.parse(saved);
        setWatchedAuctions(new Set(auctionIds));
      } catch (error) {
        console.error('Error loading watched auctions:', error);
      }
    }
  }, []);

  // Save to localStorage whenever watchedAuctions changes
  useEffect(() => {
    localStorage.setItem('watchedAuctions', JSON.stringify(Array.from(watchedAuctions)));
  }, [watchedAuctions]);

  const isWatching = (auctionId: number): boolean => {
    return watchedAuctions.has(auctionId);
  };

  const toggleWatch = (auctionId: number): void => {
    setWatchedAuctions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(auctionId)) {
        newSet.delete(auctionId);
      } else {
        newSet.add(auctionId);
      }
      return newSet;
    });
  };

  return (
    <WatchListContext.Provider value={{
      watchedAuctions,
      isWatching,
      toggleWatch,
      watchCount: watchedAuctions.size
    }}>
      {children}
    </WatchListContext.Provider>
  );
};

export const useWatchList = (): WatchListContextType => {
  const context = useContext(WatchListContext);
  if (!context) {
    throw new Error('useWatchList must be used within a WatchListProvider');
  }
  return context;
};
