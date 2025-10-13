import { createContext, useContext, ReactNode, useReducer, useEffect } from 'react';

interface WishlistItem {
  productId: string;
  itemType: 'product' | 'auction';
  addedAt: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  priceAlert?: number;
  stockAlert?: boolean;
  backInStockAlert?: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  isLoaded: boolean;
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: { productId: string; itemType: 'product' | 'auction'; options?: Partial<WishlistItem> } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: WishlistItem[] }
  | { type: 'SET_LOADED' };

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM':
      if (state.items.some(item => item.productId === action.payload.productId)) {
        return state;
      }
      return {
        ...state,
        items: [...state.items, {
          productId: action.payload.productId,
          itemType: action.payload.itemType,
          addedAt: new Date().toISOString(),
          priority: 'medium',
          stockAlert: true,
          backInStockAlert: true,
          ...action.payload.options
        }]
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload)
      };
    case 'LOAD_FROM_STORAGE':
      return { ...state, items: action.payload };
    case 'SET_LOADED':
      return { ...state, isLoaded: true };
    default:
      return state;
  }
};

interface WishlistContextValue {
  state: WishlistState;
  addItem: (productId: string, itemType: 'product' | 'auction', options?: Partial<WishlistItem>) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Legacy compatibility
  addToWishlist: (itemId: string, itemType: string) => void;
  removeFromWishlist: (itemId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [], isLoaded: false });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lovable-wishlist');
      if (stored) {
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: JSON.parse(stored) });
      }
    } catch (error) {
      console.warn('Failed to load wishlist:', error);
    }
    dispatch({ type: 'SET_LOADED' });
  }, []);

  useEffect(() => {
    if (state.isLoaded) {
      try {
        localStorage.setItem('lovable-wishlist', JSON.stringify(state.items));
      } catch (error) {
        console.warn('Failed to save wishlist:', error);
      }
    }
  }, [state.items, state.isLoaded]);

  const addItem = (productId: string, itemType: 'product' | 'auction', options?: Partial<WishlistItem>) => {
    dispatch({ type: 'ADD_ITEM', payload: { productId, itemType, options } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.productId === productId);
  };

  // Legacy compatibility
  const addToWishlist = (itemId: string, itemType: string) => {
    addItem(itemId, itemType as 'product' | 'auction');
  };

  const removeFromWishlist = (itemId: string) => {
    removeItem(itemId);
  };

  return (
    <WishlistContext.Provider value={{ 
      state, 
      addItem, 
      removeItem, 
      isInWishlist,
      addToWishlist,
      removeFromWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
