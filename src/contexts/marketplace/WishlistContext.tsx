// Stub file to prevent import errors
import React, { createContext, useContext } from 'react';

interface WishlistContextType {
  wishlist: any[];
  addToWishlist: (item: any) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  addItem: (item: any) => void;
  removeItem: (itemId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value: WishlistContextType = {
    wishlist: [],
    addToWishlist: () => {},
    removeFromWishlist: () => {},
    isInWishlist: () => false,
    addItem: () => {},
    removeItem: () => {},
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
