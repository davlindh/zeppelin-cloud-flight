import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  type: 'product' | 'service';
  title: string;
  price: number;
  image: string;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
    material?: string;
  };
}

interface CartContextType {
  state: { items: CartItem[]; itemCount: number; total: number };
  addItem: (id: string, title: string, price: number, quantity: number, selectedVariants: any, image?: string) => void;
  removeItem: (id: string, selectedVariants: any) => void;
  updateQuantity: (id: string, selectedVariants: any, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('marketplace-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('marketplace-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (id: string, title: string, price: number, quantity: number, selectedVariants: any, image?: string) => {
    const itemKey = `${id}-${JSON.stringify(selectedVariants)}`;
    setCartItems((prev) => {
      const existingItem = prev.find((i) => `${i.id}-${JSON.stringify(i.variant)}` === itemKey);
      if (existingItem) {
        return prev.map((i) =>
          `${i.id}-${JSON.stringify(i.variant)}` === itemKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { id, type: 'product' as const, title, price, image: image || '', quantity, variant: selectedVariants }];
    });
  };

  const removeItem = (id: string, selectedVariants: any) => {
    const itemKey = `${id}-${JSON.stringify(selectedVariants)}`;
    setCartItems((prev) => prev.filter((item) => `${item.id}-${JSON.stringify(item.variant)}` !== itemKey));
  };

  const updateQuantity = (id: string, selectedVariants: any, quantity: number) => {
    const itemKey = `${id}-${JSON.stringify(selectedVariants)}`;
    if (quantity <= 0) {
      removeItem(id, selectedVariants);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (`${item.id}-${JSON.stringify(item.variant)}` === itemKey ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <CartContext.Provider
      value={{
        state: { items: cartItems, itemCount: totalItems, total: totalPrice },
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
