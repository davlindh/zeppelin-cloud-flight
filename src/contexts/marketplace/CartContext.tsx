
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { 
  CartState, 
  CartAction, 
  CartContextType, 
  CartVariants,
  CartItem
} from '@/types/cart';

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'ADD_ITEM': {
      const { productId, selectedVariants, quantity, title, price, image, maxQuantity } = action.payload;
      
      const existingItemIndex = state.items.findIndex(item => 
        item.productId === productId && 
        JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];
        if (!existingItem) return state;
        const newQuantity = existingItem.quantity + quantity;
        
        // Check max quantity constraint
        if (maxQuantity && newQuantity > maxQuantity) {
          return {
            ...state,
            error: `Cannot add more than ${maxQuantity} items`
          };
        }
        
        updatedItems[existingItemIndex] = {
          id: existingItem.id,
          productId: existingItem.productId,
          title: existingItem.title,
          price: existingItem.price,
          quantity: newQuantity,
          selectedVariants: existingItem.selectedVariants,
          image: existingItem.image,
          maxQuantity: existingItem.maxQuantity
        };
        
        const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = updatedItems.reduce((count, item) => count + item.quantity, 0);
        
        return {
          ...state,
          items: updatedItems,
          total,
          itemCount,
          error: null
        };
      }

      const newItem: CartItem = {
        id: `${productId}-${Date.now()}`,
        productId,
        title,
        price,
        quantity,
        selectedVariants,
        image,
        maxQuantity
      };

      const newItems = [...state.items, newItem];
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        error: null
      };
    }
    
    case 'REMOVE_ITEM': {
      const { productId, selectedVariants } = action.payload;
      const filteredItems = state.items.filter(item => 
        !(item.productId === productId && 
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants))
      );
      const total = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = filteredItems.reduce((count, item) => count + item.quantity, 0);
      
      return {
        ...state,
        items: filteredItems,
        total,
        itemCount,
        error: null
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, selectedVariants, quantity } = action.payload;
      const updatedItems = state.items.map(item => {
        if (item.productId === productId && 
            JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)) {
          
          const newQuantity = Math.max(0, quantity);
          
          // Check max quantity constraint
          if (item.maxQuantity && newQuantity > item.maxQuantity) {
            return item; // Don't update if exceeding max
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);

      const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = updatedItems.reduce((count, item) => count + item.quantity, 0);

      return {
        ...state,
        items: updatedItems,
        total,
        itemCount,
        error: null
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,
        error: null
      };
      
    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { 
    items: [], 
    total: 0, 
    itemCount: 0,
    isLoading: false,
    error: null
  });

  const addItem = (
    productId: string, 
    title: string, 
    price: number, 
    quantity: number, 
    selectedVariants: CartVariants,
    image?: string,
    maxQuantity?: number
  ) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { productId, title, price, quantity, selectedVariants, image, maxQuantity }
    });
  };

  const removeItem = (productId: string, selectedVariants: CartVariants) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedVariants } });
  };

  const updateQuantity = (productId: string, selectedVariants: CartVariants, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, selectedVariants, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = (): number => {
    return state.itemCount;
  };

  const getTotalPrice = (): number => {
    return state.total;
  };

  const hasItems = (): boolean => {
    return state.items.length > 0;
  };

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotalPrice,
      hasItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
