
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/marketplace/CartContext';
import { useProduct } from '@/hooks/marketplace/useProducts';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartProductItem = ({ item, updateQuantity, removeItem }: {
  item: any;
  updateQuantity: (id: string, variants: any, quantity: number) => void;
  removeItem: (id: string, variants: any) => void;
}) => {
  const { data: product, isLoading } = useProduct(item.id);

  if (isLoading) {
    return (
      <div className="flex gap-3 p-3 border border-slate-200 rounded-lg animate-pulse">
        <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
        <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
          <X className="h-6 w-6 text-red-500" />
        </div>
        <div className="flex-1">
          <p className="text-red-600 font-medium">Product not found</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.id, item.variant)}
            className="text-red-500 hover:text-red-700 p-0 h-auto"
          >
            Remove from cart
          </Button>
        </div>
      </div>
    );
  }

  const formatVariants = (variants: any) => {
    const parts = [];
    if (variants?.size) parts.push(variants.size);
    if (variants?.color) parts.push(variants.color);
    if (variants?.material) parts.push(variants.material);
    return parts.join(', ');
  };

  return (
    <div className="flex gap-3 p-3 border border-slate-200 rounded-lg">
      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-xs text-slate-500">IMG</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-slate-900 truncate">
          {product.title}
        </h4>
        {formatVariants(item.variant) && (
          <p className="text-xs text-slate-500 mt-1">
            {formatVariants(item.variant)}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-slate-900">
            ${product.price}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              onClick={() => removeItem(item.id, item.variant)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { state, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (state.items.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">Your cart is empty</p>
            <Button 
              onClick={onClose} 
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
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({state.itemCount} items)
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {state.items.map((item, index) => (
              <CartProductItem
                key={`${item.id}-${JSON.stringify(item.variant)}-${index}`}
                item={item}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))}
          </div>
          
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-bold text-xl">${state.total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onClose}
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
