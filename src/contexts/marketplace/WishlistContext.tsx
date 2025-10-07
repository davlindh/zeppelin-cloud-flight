
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/marketplace/useUserProfile';

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
  | { type: 'UPDATE_ITEM'; payload: { productId: string; updates: Partial<WishlistItem> } }
  | { type: 'BULK_REMOVE'; payload: string[] }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_FROM_DATABASE'; payload: WishlistItem[] }
  | { type: 'SET_LOADED' };

const STORAGE_KEY = 'lovable-wishlist';

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Check if item already exists
      if (state.items.some(item => item.productId === action.payload.productId)) {
        return state;
      }
      const newItem: WishlistItem = {
        productId: action.payload.productId,
        itemType: action.payload.itemType,
        addedAt: new Date().toISOString(),
        priority: 'medium',
        stockAlert: true,
        backInStockAlert: true,
        ...action.payload.options
      };
      return {
        ...state,
        items: [...state.items, newItem]
      };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload)
      };
    }
    case 'UPDATE_ITEM': {
      return {
        ...state,
        items: state.items.map(item => 
          item.productId === action.payload.productId 
            ? { ...item, ...action.payload.updates }
            : item
        )
      };
    }
    case 'BULK_REMOVE': {
      return {
        ...state,
        items: state.items.filter(item => !action.payload.includes(item.productId))
      };
    }
    case 'CLEAR_WISHLIST': {
      return { ...state, items: [] };
    }
    case 'LOAD_FROM_DATABASE':
      return {
        ...state,
        items: action.payload
      };
    case 'SET_LOADED':
      return {
        ...state,
        isLoaded: true
      };
    default:
      return state;
  }
};

const saveToStorage = (items: WishlistItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to save wishlist to localStorage:', error);
  }
};

const loadFromStorage = (): WishlistItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load wishlist from localStorage:', error);
    return [];
  }
};

interface WishlistContextType {
  state: WishlistState;
  addItem: (productId: string, itemType: 'product' | 'auction', options?: Partial<WishlistItem>) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, updates: Partial<WishlistItem>) => void;
  bulkRemove: (productIds: string[]) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistItem: (productId: string) => WishlistItem | undefined;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [], isLoaded: false });
  const { isAuthenticated, profile } = useUserProfile();

  // Load wishlist data
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated && profile?.id) {
        // Load from database for authenticated users using proper UUID
        try {
          const { data, error } = await supabase
            .from('user_favorites')
            .select('*')
            .eq('user_id', profile.id);

          if (error) throw error;

          const wishlistItems: WishlistItem[] = (data ?? []).map(item => ({
            productId: item.item_id,
            itemType: item.item_type as 'product' | 'auction',
            addedAt: item.created_at,
            notes: item.notes || undefined,
            priority: item.is_priority ? 'high' : 'medium'
          }));

          dispatch({ type: 'LOAD_FROM_DATABASE', payload: wishlistItems });
        } catch (error) {
          console.error('Failed to load wishlist from database:', error);
          // Fallback to localStorage
          const storedItems = loadFromStorage();
          dispatch({ type: 'LOAD_FROM_DATABASE', payload: storedItems });
        }
      } else {
        // Load from localStorage for guests
        const storedItems = loadFromStorage();
        dispatch({ type: 'LOAD_FROM_DATABASE', payload: storedItems });
      }
      dispatch({ type: 'SET_LOADED' });
    };

    loadWishlist();
  }, [isAuthenticated, profile?.id]);

  const addItem = async (productId: string, itemType: 'product' | 'auction', options?: Partial<WishlistItem>) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { productId, itemType, options }
    });

    if (isAuthenticated && profile?.id) {
      try {
        await supabase
          .from('user_favorites')
          .insert({
            user_id: profile.id,
            item_id: productId,
            item_type: itemType,
            notes: options?.notes,
            is_priority: options?.priority === 'high'
          });
      } catch (error) {
        console.error('Failed to save to database:', error);
        saveToStorage(state.items);
      }
    } else {
      saveToStorage([...state.items, {
        productId,
        itemType,
        addedAt: new Date().toISOString(),
        priority: 'medium',
        stockAlert: true,
        backInStockAlert: true,
        ...options
      }]);
    }
  };

  const removeItem = async (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });

    if (isAuthenticated && profile?.id) {
      try {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', profile.id)
          .eq('item_id', productId);
      } catch (error) {
        console.error('Failed to remove from database:', error);
        saveToStorage(state.items.filter(item => item.productId !== productId));
      }
    } else {
      saveToStorage(state.items.filter(item => item.productId !== productId));
    }
  };

  const updateItem = async (productId: string, updates: Partial<WishlistItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { productId, updates } });

    if (isAuthenticated && profile?.id) {
      try {
        await supabase
          .from('user_favorites')
          .update({
            notes: updates.notes,
            is_priority: updates.priority === 'high'
          })
          .eq('user_id', profile.id)
          .eq('item_id', productId);
      } catch (error) {
        console.error('Failed to update in database:', error);
      }
    } else {
      const updatedItems = state.items.map(item => 
        item.productId === productId ? { ...item, ...updates } : item
      );
      saveToStorage(updatedItems);
    }
  };

  const bulkRemove = async (productIds: string[]) => {
    dispatch({ type: 'BULK_REMOVE', payload: productIds });

    if (isAuthenticated && profile?.id) {
      try {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', profile.id)
          .in('item_id', productIds);
      } catch (error) {
        console.error('Failed to bulk remove from database:', error);
        saveToStorage(state.items.filter(item => !productIds.includes(item.productId)));
      }
    } else {
      saveToStorage(state.items.filter(item => !productIds.includes(item.productId)));
    }
  };

  const clearWishlist = async () => {
    dispatch({ type: 'CLEAR_WISHLIST' });

    if (isAuthenticated && profile?.id) {
      try {
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', profile.id);
      } catch (error) {
        console.error('Failed to clear database wishlist:', error);
        saveToStorage([]);
      }
    } else {
      saveToStorage([]);
    }
  };

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.productId === productId);
  };

  const getWishlistItem = (productId: string) => {
    return state.items.find(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateItem,
      bulkRemove,
      isInWishlist,
      clearWishlist,
      getWishlistItem
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
