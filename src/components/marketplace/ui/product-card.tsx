/**
 * ProductCard - Unified product card component
 * 
 * Supports two variants:
 * - default: Simple card with basic info and robust error handling
 * - enhanced: Rich card with animations, quick actions, and analytics
 * 
 * @example
 * // Basic usage
 * <ProductCard product={product} />
 * 
 * @example
 * // Full-featured enhanced card
 * <ProductCard 
 *   product={product}
 *   variant="enhanced"
 *   showQuickActions
 *   showAnalytics
 *   onBrandClick={handleFilter}
 * />
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FloatingActionButtons } from '@/components/marketplace/ui/floating-action-buttons';
import { useCart } from '@/contexts/marketplace/CartContext';
import { useQuickActions } from '@/hooks/marketplace/useQuickActions';
import { useToast } from '@/hooks/use-toast';
import { getProductStatusBadge, calculateProductAnalytics } from '@/utils/marketplace/productUtils';
import { getImageUrl, getImageAlt } from '@/utils/marketplace/imageUtils';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/unified';

interface ProductCardProps {
  // Required
  product: Product;
  
  // Optional display
  variant?: 'default' | 'enhanced';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  
  // Optional enhanced features
  showQuickActions?: boolean;
  showAnalytics?: boolean;
  
  // Optional callbacks
  onQuickView?: () => void;
  onToggleComparison?: (product: Product) => void;
  isInComparison?: boolean;
  onBrandClick?: (brand: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  size = 'sm',
  href,
  showQuickActions = false,
  showAnalytics = false,
  onQuickView,
  onToggleComparison,
  isInComparison = false,
  onBrandClick
}) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const {
    isWatching,
    isSharing,
    handleToggleWatch,
    handleShare
  } = useQuickActions({
    itemId: product.id,
    itemType: 'product',
    itemTitle: product.title,
    price: product.price,
    onQuickView
  });

  const finalHref = href || `/marketplace/shop/${product.id}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addItem(product.id, product.title, product.price, 1, {});
    
    toast({
      title: "Added to cart",
      description: `"${product.title}" has been added to your cart.`,
    });
    
    setAddingToCart(false);
  };

  const handleToggleComparisonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onToggleComparison) {
      onToggleComparison(product);
      
      toast({
        title: isInComparison ? "Removed from comparison" : "Added to comparison",
        description: isInComparison 
          ? `"${product.title}" removed from comparison.`
          : `"${product.title}" added to comparison.`,
      });
    }
  };

  const handleBrandClickEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onBrandClick && product.brand) {
      onBrandClick(product.brand);
    }
  };

  // Image error handler - CRITICAL: Used for all image variants
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`[ProductCard] Failed to load image for product: ${product.title}`);
    e.currentTarget.src = '/placeholder.svg';
    setImageLoaded(true);
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const analytics = showAnalytics ? calculateProductAnalytics(product) : null;
  const statusBadge = analytics ? getProductStatusBadge(analytics) : null;

  const isEnhanced = variant === 'enhanced';
  
  // Size-aware styling
  const sizeClasses = {
    xs: 'card-xs',
    sm: 'card-sm', 
    md: 'card-md',
    lg: 'card-lg',
    xl: 'card-xl'
  };
  
  const imageSizeClasses = {
    xs: 'aspect-square',
    sm: 'aspect-[5/6]',
    md: 'aspect-[4/5]', 
    lg: 'aspect-[3/4]',
    xl: 'aspect-[2/3]'
  };
  
  const titleSizeClasses = {
    xs: 'text-sm font-medium',
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold'
  };
  
  const priceSizeClasses = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const stockCount = product.inStock ? 50 : 0;

  return (
    <Link to={finalHref}>
      <Card className={cn(
        "product-card-compact group relative overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
        isEnhanced ? "shadow-lg border-0 bg-white rounded-2xl animate-fade-in" : "card-base card-hover border border-border/50",
        sizeClasses[size]
      )}>
        {/* Floating Action Buttons - Only if enabled */}
        {isEnhanced && showQuickActions && (
          <FloatingActionButtons
            isWatching={isWatching}
            isSharing={isSharing}
            isInComparison={isInComparison}
            onToggleWatch={handleToggleWatch}
            onQuickView={onQuickView}
            onShare={handleShare}
            onToggleComparison={onToggleComparison ? handleToggleComparisonClick : undefined}
          />
        )}

        <CardHeader className={isEnhanced ? "p-0" : "pb-3"}>
          {/* Product Image - WITH ERROR HANDLING */}
          <div className={cn(
            "relative overflow-hidden",
            isEnhanced ? "aspect-square rounded-t-2xl" : imageSizeClasses[size]
          )}>
            {!imageLoaded && (
              <div className={cn(
                "absolute inset-0 animate-pulse",
                isEnhanced ? "bg-slate-200" : "skeleton-pulse w-full h-full"
              )} />
            )}
            
            <img 
              src={getImageUrl(product.image)}
              alt={getImageAlt(product.title, 'product')}
              className={cn(
                "w-full h-full object-cover",
                isEnhanced ? "transition-transform duration-700 group-hover:scale-105" : "rounded-md"
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
            />
            
            {/* Discount Badge */}
            {discountPercent > 0 && (
              <Badge className={cn(
                "absolute bg-red-500 hover:bg-red-600 animate-pulse",
                isEnhanced ? "top-4 left-1/2 transform -translate-x-1/2 z-20 text-xs text-white shadow-lg border-0 backdrop-blur-sm" : "top-2 left-2"
              )}>
                {isEnhanced ? `-${discountPercent}%` : 'Sale'}
              </Badge>
            )}

            {/* Stock indicator */}
            {stockCount < 10 && stockCount > 0 && (
              <Badge className={cn(
                "absolute bg-orange-500",
                isEnhanced ? "bottom-4 left-4 z-20 text-xs shadow-lg bg-white/95 backdrop-blur-sm border-0 text-orange-700" : "top-2 right-2"
              )}>
                Only {stockCount} left
              </Badge>
            )}

            {/* Status Badge - Only if analytics enabled */}
            {isEnhanced && statusBadge && (
              <div className="absolute bottom-4 right-4 z-20">
                <Badge 
                  variant={statusBadge.variant} 
                  className="text-xs font-medium shadow-lg bg-white/95 backdrop-blur-sm border-0"
                >
                  {statusBadge.text}
                </Badge>
              </div>
            )}
          </div>
          
          {/* Category and Stock - Non-enhanced version */}
          {!isEnhanced && (
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs capitalize">
                {product.categoryName}
              </Badge>
              <Badge 
                variant={product.inStock ? "default" : "secondary"} 
                className={`text-xs ${product.inStock ? 'status-available' : 'status-unavailable'}`}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
          )}
          
          {/* Product Title */}
          <CardTitle className={cn(
            "group-hover:text-blue-600 transition-colors leading-tight",
            isEnhanced ? "text-lg font-semibold text-slate-900 line-clamp-2" : titleSizeClasses[size]
          )}>
            {product.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className={cn(
          "flex-grow flex flex-col justify-end",
          isEnhanced ? "p-6 space-y-4" : ""
        )}>

          {/* Category and Brand - Enhanced version */}
          {isEnhanced && (
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs capitalize w-fit">
                {product.categoryName}
              </Badge>
              {product.brand && product.brand.trim() !== '' && (
                <div onClick={handleBrandClickEvent}>
                  <Badge 
                    variant="secondary" 
                    className="text-xs capitalize w-fit cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    {product.brand}
                  </Badge>
                </div>
              )}
            </div>
          )}
          
          {/* Rating */}
          {isEnhanced ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {product.rating} ({product.reviews})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
              <span>⭐ {product.rating}</span>
              <span>({product.reviews})</span>
            </div>
          )}

          {/* Pricing */}
          <div className={cn("mb-6", isEnhanced && "space-y-2")}>
            <div className="flex items-center gap-3">
              <span className={cn(
                "font-bold text-foreground",
                isEnhanced ? "text-3xl" : priceSizeClasses[size]
              )}>
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className={cn(
                    "text-muted-foreground line-through",
                    isEnhanced ? "text-xl" : size === 'xs' ? 'text-sm' : size === 'xl' ? 'text-2xl' : 'text-lg'
                  )}>
                    ${product.originalPrice.toLocaleString()}
                  </span>
                  {isEnhanced && (
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                      Save ${(product.originalPrice - product.price).toLocaleString()}
                    </Badge>
                  )}
                </>
              )}
            </div>
            {isEnhanced && product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-green-600 font-medium">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off retail price
              </p>
            )}
          </div>
          
          {/* Action Button */}
          <Button 
            className={cn(
              "w-full disabled:opacity-50 transition-all duration-200",
              isEnhanced 
                ? "h-14 rounded-xl font-semibold text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl hover:scale-[1.02] text-primary-foreground border-0" 
                : "btn-primary h-10"
            )}
            disabled={!product.inStock || addingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className={cn("mr-2", isEnhanced ? "h-5 w-5" : "h-4 w-4")} />
            {addingToCart ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};
