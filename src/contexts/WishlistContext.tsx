import { createContext, useContext, ReactNode } from 'react';

interface WishlistContextValue {
  addToWishlist: (itemId: string, itemType: string) => void;
  removeFromWishlist: (itemId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    // Return default implementation if context not available
    return {
      addToWishlist: () => {},
      removeFromWishlist: () => {},
    };
  }
  return context;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const addToWishlist = (itemId: string, itemType: string) => {
    console.log('Add to wishlist:', itemId, itemType);
  };

  const removeFromWishlist = (itemId: string) => {
    console.log('Remove from wishlist:', itemId);
  };

  return (
    <WishlistContext.Provider value={{ addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
