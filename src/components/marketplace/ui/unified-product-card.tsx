import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/marketplace/CartProvider';
import { useToast } from '@/hooks/use-toast';

interface UnifiedProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  image: string;
  images?: string[];
  href?: string;
  variant?: 'default' | 'enhanced';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  stockCount?: number;
  recentViews?: number;
  onQuickView?: () => void;
}

export const UnifiedProductCard: React.FC<UnifiedProductCardProps> = ({
  id,
  title,
  price,
  originalPrice,
  category,
  rating,
  reviews,
  inStock,
  image,
  href = `/shop/${id}`,
  variant = 'default',
  size = 'sm',
  stockCount = inStock ? 50 : 0,
}) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(true);
    
    // Simulate API delay for demo
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addItem(id, title, price, 1, {});
    
    toast({
      title: "Added to cart",
      description: `"${title}" has been added to your cart.`,
    });
    
    setAddingToCart(false);
  };

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
    <Link to={href}>
      <Card className={`card-base card-hover group relative overflow-hidden h-full transition-all duration-300 hover:shadow-xl ${sizeClasses[size]}`}>
        <CardHeader className="pb-3">
          {/* Enhanced Product Image */}
          <div className={`card-image relative ${imageSizeClasses[size]}`}>
            {!imageLoaded && (
              <div className="skeleton-pulse w-full h-full absolute inset-0" />
            )}
            
            <img 
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded-md"
              onLoad={() => setImageLoaded(true)}
            />
            
            {originalPrice && originalPrice > price && (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 animate-pulse">
                Sale
              </Badge>
            )}

            {/* Stock indicator */}
            {stockCount < 10 && stockCount > 0 && (
              <Badge className="absolute top-2 right-2 bg-orange-500">
                Only {stockCount} left
              </Badge>
            )}
          </div>
          
          {/* Category and Stock Status */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs capitalize">
              {category}
            </Badge>
            <Badge 
              variant={inStock ? "default" : "secondary"} 
              className={`text-xs ${inStock ? 'status-available' : 'status-unavailable'}`}
            >
              {inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>
          
          {/* Product Title */}
          <CardTitle className={`${titleSizeClasses[size]} group-hover:text-blue-600 transition-colors leading-tight`}>
            {title}
          </CardTitle>
          
          {/* Rating */}
          {isEnhanced ? (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-slate-600">
                {rating} ({reviews})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
              <span>⭐ {rating}</span>
              <span>({reviews})</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col justify-end">
          {/* Pricing */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`${priceSizeClasses[size]} font-bold text-slate-900`}>
              ${price.toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
              <span className={`text-slate-500 line-through ${size === 'xs' ? 'text-sm' : size === 'xl' ? 'text-2xl' : 'text-lg'}`}>
                ${originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Action Button */}
          <Button 
            className="w-full btn-primary disabled:opacity-50"
            disabled={!inStock || addingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {addingToCart ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};
