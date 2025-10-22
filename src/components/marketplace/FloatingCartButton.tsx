import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/marketplace/CartContext';

interface FloatingCartButtonProps {
  onClick: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const { state } = useCart();

  // Only show if there are items in cart
  if (state.itemCount === 0) return null;

  return (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 md:hidden"
      onClick={onClick}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          variant="destructive"
        >
          {state.itemCount}
        </Badge>
      </div>
    </Button>
  );
};
