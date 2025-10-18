import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FloatingActionButtons } from '@/components/marketplace/ui/floating-action-buttons';
import { useCart } from '@/contexts/marketplace/CartProvider';
import { useQuickActions } from '@/hooks/marketplace/useQuickActions';
import { useToast } from '@/hooks/use-toast';
import { getProductStatusBadge , calculateProductAnalytics } from '@/utils/marketplace/productUtils';
import { getResponsiveImageUrl, getImageAlt, getImageUrl } from '@/utils/marketplace/imageUtils';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/unified';


interface EnhancedProductCardProps {
  // Support both Product object and individual props for flexibility
  product?: Product;
  // Individual props for unified-product-card compatibility
  id?: string;
  title?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  image?: string;
  images?: string[];
  // Enhanced features
  href?: string;
  variant?: 'default' | 'enhanced';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  stockCount?: number;
  recentViews?: number;
  onQuickView?: () => void;
  onToggleComparison?: (product: Product) => void;
  isInComparison?: boolean;
  showAnalytics?: boolean;
  onBrandClick?: (brand: string) => void;
}

export const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({
  product,
  id,
  title,
  price,
  originalPrice,
  category,
  rating,
  reviews,
  inStock,
  image,
  href,
  variant = 'default',
  size = 'sm',
  stockCount,
  onQuickView,
  onToggleComparison,
  isInComparison = false,
  onBrandClick
}) => {
  // Use product object if provided, otherwise use individual props
  const productData = product || {
    id: id!,
    title: title!,
    price: price!,
    originalPrice,
    category: category!,
    categoryName: category!,
    rating: rating!,
    reviews: reviews!,
    inStock: inStock!,
    image: image!,
    brand: undefined
  };

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
    itemId: productData.id,
    itemType: 'product',
    itemTitle: productData.title,
    price: productData.price,
    onQuickView
  });

  const finalHref = href || `/marketplace/shop/${productData.id}`;
  const finalStockCount = stockCount ?? (productData.inStock ? 50 : 0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(true);
    
    // Simulate API delay for demo
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addItem(productData.id, productData.title, productData.price, 1, {});
    
    toast({
      title: "Added to cart",
      description: `"${productData.title}" has been added to your cart.`,
    });
    
    setAddingToCart(false);
  };

  const handleToggleComparisonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onToggleComparison && product) {
      onToggleComparison(product);
      
      toast({
        title: isInComparison ? "Removed from comparison" : "Added to comparison",
        description: isInComparison 
          ? `"${productData.title}" removed from comparison.`
          : `"${productData.title}" added to comparison.`,
      });
    }
  };

  const handleBrandClickEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onBrandClick && product?.brand) {
      onBrandClick(product.brand);
    }
  };

  const discountPercent = productData.originalPrice 
    ? Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)
    : 0;

  const analytics = product ? calculateProductAnalytics(product) : null;
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

  return (
    <Link to={finalHref}>
      <Card className={cn(
        "group relative overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
        isEnhanced ? "shadow-lg border-0 bg-white rounded-2xl animate-fade-in" : "card-base card-hover border border-border/50",
        sizeClasses[size]
      )}>
        {/* Floating Action Buttons - Enhanced version only */}
        {isEnhanced && (
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
          {/* Product Image */}
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
            
            {isEnhanced && product ? (
              <picture>
                <source 
                  media="(max-width: 640px)" 
                  srcSet={getResponsiveImageUrl(productData.image)} 
                />
                <source 
                  media="(max-width: 1024px)" 
                  srcSet={getResponsiveImageUrl(productData.image)} 
                />
                <img 
                  src={getResponsiveImageUrl(productData.image)} 
                  alt={getImageAlt(productData.title, 'product')}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                />
              </picture>
            ) : (
              <img 
                src={getImageUrl(productData.image || '')}
                alt={productData.title}
                className="w-full h-full object-cover rounded-md"
                onLoad={() => setImageLoaded(true)}
              />
            )}
            
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
            {finalStockCount < 10 && finalStockCount > 0 && (
              <Badge className={cn(
                "absolute bg-orange-500",
                isEnhanced ? "bottom-4 left-4 z-20 text-xs shadow-lg bg-white/95 backdrop-blur-sm border-0 text-orange-700" : "top-2 right-2"
              )}>
                Only {finalStockCount} left
              </Badge>
            )}

            {/* Status Badge - Enhanced version only */}
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
          
          {/* Category and Brand - Non-enhanced version */}
          {!isEnhanced && (
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs capitalize">
                {(productData as any).categoryName || (productData as any).category}
              </Badge>
              <Badge 
                variant={productData.inStock ? "default" : "secondary"} 
                className={`text-xs ${productData.inStock ? 'status-available' : 'status-unavailable'}`}
              >
                {productData.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>
          )}
          
          {/* Product Title */}
          <CardTitle className={cn(
            "group-hover:text-blue-600 transition-colors leading-tight",
            isEnhanced ? "text-lg font-semibold text-slate-900 line-clamp-2" : titleSizeClasses[size]
          )}>
            {productData.title}
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
                {(productData as any).categoryName || (productData as any).category}
              </Badge>
              {product?.brand && (
                <Badge 
                  variant="secondary" 
                  className="text-xs capitalize w-fit cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  clickable={true}
                  onClick={() => {
                    if (onBrandClick && product.brand) {
                      onBrandClick(product.brand);
                    }
                  }}
                >
                  {product.brand}
                </Badge>
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
                    className={`h-4 w-4 ${i < Math.floor(productData.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {productData.rating} ({productData.reviews})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
              <span>⭐ {productData.rating}</span>
              <span>({productData.reviews})</span>
            </div>
          )}

          {/* Enhanced Pricing */}
          <div className={cn("mb-6", isEnhanced && "space-y-2")}>
            <div className="flex items-center gap-3">
              <span className={cn(
                "font-bold text-foreground",
                isEnhanced ? "text-3xl" : priceSizeClasses[size]
              )}>
                ${productData.price.toLocaleString()}
              </span>
              {productData.originalPrice && productData.originalPrice > productData.price && (
                <>
                  <span className={cn(
                    "text-muted-foreground line-through",
                    isEnhanced ? "text-xl" : size === 'xs' ? 'text-sm' : size === 'xl' ? 'text-2xl' : 'text-lg'
                  )}>
                    ${productData.originalPrice.toLocaleString()}
                  </span>
                  {isEnhanced && (
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                      Save ${(productData.originalPrice - productData.price).toLocaleString()}
                    </Badge>
                  )}
                </>
              )}
            </div>
            {isEnhanced && productData.originalPrice && productData.originalPrice > productData.price && (
              <p className="text-sm text-green-600 font-medium">
                {Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}% off retail price
              </p>
            )}
          </div>
          
          {/* Enhanced Action Button */}
          <Button 
            className={cn(
              "w-full disabled:opacity-50 transition-all duration-200",
              isEnhanced 
                ? "h-14 rounded-xl font-semibold text-lg bg-gradient-to-r from-primary to-primary-glow hover:shadow-xl hover:scale-[1.02] text-primary-foreground border-0" 
                : "btn-primary h-10"
            )}
            disabled={!productData.inStock || addingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className={cn("mr-2", isEnhanced ? "h-5 w-5" : "h-4 w-4")} />
            {addingToCart ? 'Adding...' : productData.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};
