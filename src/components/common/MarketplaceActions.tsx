import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/marketplace/CartProvider';

interface MarketplaceActionsProps {
  onCartClick?: () => void;
  showLabels?: boolean;
  variant?: 'default' | 'compact';
}

export const MarketplaceActions: React.FC<MarketplaceActionsProps> = ({
  onCartClick,
  showLabels = false,
  variant = 'default',
}) => {
  // Access cart state - component must be wrapped in CartProvider
  const { state } = useCart();
  const itemCount = state?.itemCount || 0;

  const iconSize = variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5';
  const buttonSize = variant === 'compact' ? 'sm' : 'icon';

  if (showLabels) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Link to="/marketplace/wishlist" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Heart className={iconSize} />
            <span>Önskelista</span>
          </Button>
        </Link>
        <Link to="/marketplace/notifications" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Bell className={iconSize} />
            <span>Notifikationer</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 relative"
          onClick={onCartClick}
          asChild={!onCartClick}
        >
          {onCartClick ? (
            <>
              <ShoppingCart className={iconSize} />
              <span>Varukorg</span>
              {itemCount > 0 && (
                <Badge
                  className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {itemCount}
                </Badge>
              )}
            </>
          ) : (
            <Link to="/marketplace/cart">
              <ShoppingCart className={iconSize} />
              <span>Varukorg</span>
              {itemCount > 0 && (
                <Badge
                  className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link to="/marketplace/wishlist">
        <Button variant="ghost" size={buttonSize} aria-label="Önskelista">
          <Heart className={iconSize} />
        </Button>
      </Link>
      <Link to="/marketplace/notifications">
        <Button variant="ghost" size={buttonSize} aria-label="Notifikationer">
          <Bell className={iconSize} />
        </Button>
      </Link>
      {onCartClick ? (
        <Button
          variant="ghost"
          size={buttonSize}
          className="relative"
          onClick={onCartClick}
          aria-label="Varukorg"
        >
          <ShoppingCart className={iconSize} />
          {itemCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      ) : (
        <Link to="/marketplace/cart">
          <Button variant="ghost" size={buttonSize} className="relative" aria-label="Varukorg">
            <ShoppingCart className={iconSize} />
            {itemCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                variant="destructive"
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        </Link>
      )}
    </div>
  );
};
