
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { 
  CartState, 
  CartAction, 
  CartContextType, 
  CartVariants,
  CartItem,
  ProductCartItem,
  EventTicketCartItem
} from '@/types/marketplace/cart';

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'ADD_ITEM': {
      const { productId, selectedVariants, quantity, title, price, image, maxQuantity } = action.payload;
      
      const existingItemIndex = state.items.findIndex(item => 
        item.kind === 'product' && item.productId === productId && 
        JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];
        if (!existingItem || existingItem.kind !== 'product') return state;
        const newQuantity = existingItem.quantity + quantity;
        
        // Check max quantity constraint
        if (maxQuantity && newQuantity > maxQuantity) {
          return {
            ...state,
            error: `Cannot add more than ${maxQuantity} items`
          };
        }
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
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

      const newItem: ProductCartItem = {
        kind: 'product',
        id: `product-${productId}-${Date.now()}`,
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
    
    case 'ADD_TICKET': {
      const { ticketTypeId, eventId, eventTitle, eventDate, title, price, quantity, image, maxQuantity } = action.payload;
      
      const existingItemIndex = state.items.findIndex(item => 
        item.kind === 'event_ticket' && item.ticketTypeId === ticketTypeId
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];
        if (!existingItem || existingItem.kind !== 'event_ticket') return state;
        const newQuantity = existingItem.quantity + quantity;
        
        if (maxQuantity && newQuantity > maxQuantity) {
          return {
            ...state,
            error: `Cannot add more than ${maxQuantity} tickets`
          };
        }
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity
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

      const newItem: EventTicketCartItem = {
        kind: 'event_ticket',
        id: `ticket-${ticketTypeId}-${Date.now()}`,
        ticketTypeId,
        eventId,
        eventTitle,
        eventDate,
        title,
        price,
        quantity,
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
        !(item.kind === 'product' && item.productId === productId && 
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

    case 'REMOVE_TICKET': {
      const { ticketTypeId } = action.payload;
      const filteredItems = state.items.filter(item => 
        !(item.kind === 'event_ticket' && item.ticketTypeId === ticketTypeId)
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
        if (item.kind === 'product' && item.productId === productId && 
            JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)) {
          
          const newQuantity = Math.max(0, quantity);
          
          if (item.maxQuantity && newQuantity > item.maxQuantity) {
            return item;
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

    case 'UPDATE_TICKET_QUANTITY': {
      const { ticketTypeId, quantity } = action.payload;
      const updatedItems = state.items.map(item => {
        if (item.kind === 'event_ticket' && item.ticketTypeId === ticketTypeId) {
          const newQuantity = Math.max(0, quantity);
          
          if (item.maxQuantity && newQuantity > item.maxQuantity) {
            return item;
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

  const addTicket = (
    ticketTypeId: string,
    eventId: string,
    eventTitle: string,
    eventDate: string,
    title: string,
    price: number,
    quantity: number,
    image?: string,
    maxQuantity?: number
  ) => {
    dispatch({
      type: 'ADD_TICKET',
      payload: { ticketTypeId, eventId, eventTitle, eventDate, title, price, quantity, image, maxQuantity }
    });
  };

  const removeItem = (productId: string, selectedVariants: CartVariants) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedVariants } });
  };

  const removeTicket = (ticketTypeId: string) => {
    dispatch({ type: 'REMOVE_TICKET', payload: { ticketTypeId } });
  };

  const updateQuantity = (productId: string, selectedVariants: CartVariants, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, selectedVariants, quantity } });
  };

  const updateTicketQuantity = (ticketTypeId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_TICKET_QUANTITY', payload: { ticketTypeId, quantity } });
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
      addTicket,
      removeItem,
      removeTicket,
      updateQuantity,
      updateTicketQuantity,
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
