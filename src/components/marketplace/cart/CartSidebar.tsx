import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, X as CloseIcon, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/marketplace/CartContext';
import { useProduct } from '@/hooks/marketplace/useProducts';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useIsMobile } from '@/hooks/use-mobile';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatVariants = (variants: any) => {
  const parts = [];
  if (variants?.size) parts.push(variants.size);
  if (variants?.color) parts.push(variants.color);
  if (variants?.material) parts.push(variants.material);
  return parts.join(', ');
};

const CartProductItem = ({ item, updateQuantity, removeItem }: {
  item: any;
  updateQuantity: (id: string, variants: any, quantity: number) => void;
  removeItem: (id: string, variants: any) => void;
}) => {
  const { data: product, isLoading } = useProduct(item.productId);
  const isMobile = useIsMobile();
  
  // Swipe to delete functionality
  const { elementRef, swipeDistance } = useSwipeGesture({
    onSwipeLeft: () => {
      if (isMobile) {
        removeItem(item.productId, item.selectedVariants);
      }
    },
    threshold: 100,
    enabled: isMobile
  });

  if (isLoading) {
    return (
      <div className="flex gap-3 p-3 border border-border rounded-lg animate-pulse">
        <div className="w-16 h-16 bg-muted rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex gap-3 p-3 border border-destructive/30 rounded-lg bg-destructive/5">
        <div className="w-16 h-16 bg-destructive/10 rounded-lg flex items-center justify-center">
          <CloseIcon className="h-6 w-6 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="text-destructive font-medium">Product not found</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.productId, item.selectedVariants)}
            className="text-destructive hover:text-destructive p-0 h-auto min-h-[44px]"
          >
            Remove from cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className="relative overflow-hidden"
    >
      {/* Swipe indicator background */}
      {isMobile && swipeDistance.x < -20 && (
        <div 
          className="absolute inset-0 bg-destructive flex items-center justify-end pr-6 rounded-lg"
          style={{ 
            opacity: Math.min(Math.abs(swipeDistance.x) / 100, 1)
          }}
        >
          <Trash2 className="h-5 w-5 text-destructive-foreground" />
        </div>
      )}
      
      <div 
        className="flex gap-3 p-3 border border-border rounded-lg bg-card relative"
        style={{
          transform: isMobile ? `translateX(${Math.min(swipeDistance.x, 0)}px)` : undefined,
          transition: swipeDistance.x === 0 ? 'transform 0.3s ease-out' : 'none'
        }}
      >
        <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-xs text-muted-foreground">IMG</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">
            {product.title}
          </h4>
          {formatVariants(item.selectedVariants) && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatVariants(item.selectedVariants)}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-foreground">
              ${product.price}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => updateQuantity(item.productId, item.selectedVariants, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => updateQuantity(item.productId, item.selectedVariants, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(item.productId, item.selectedVariants)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { state, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Swipe to close functionality for mobile
  const { elementRef: swipeRef } = useSwipeGesture({
    onSwipeRight: () => {
      if (isMobile && isOpen) {
        onClose();
      }
    },
    threshold: 100,
    enabled: isMobile
  });

  // Set ref after mount
  useEffect(() => {
    if (sheetRef.current) {
      (swipeRef as React.MutableRefObject<HTMLElement | null>).current = sheetRef.current;
    }
  }, [sheetRef, swipeRef]);

  const handleCheckout = () => {
    onClose();
    navigate('/marketplace/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/marketplace/cart');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/marketplace/shop');
  };

  if (state.items.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="bg-background border-border">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button 
              onClick={handleContinueShopping} 
              className="mt-4"
              variant="outline"
            >
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-background border-border" ref={sheetRef as any}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({state.itemCount} items)
          </SheetTitle>
          {isMobile && (
            <p className="text-xs text-muted-foreground">Swipe right to close or left on items to remove</p>
          )}
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {state.items.map((item, index) => (
              item.kind === 'product' ? (
                <CartProductItem
                  key={`${item.id}-${index}`}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ) : null
            ))}
          </div>
          
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-foreground">Total:</span>
              <span className="font-bold text-xl text-foreground">${state.total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleViewCart}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                View Full Cart
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground" 
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
