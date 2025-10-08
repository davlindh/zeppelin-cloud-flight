
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Star, ShoppingCart, Eye } from 'lucide-react';
import { useProducts } from '@/hooks/marketplace/useProducts';
import { getImageUrl } from '@/utils/marketplace/imageUtils';

export const FeaturedProducts: React.FC = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  
  // Get trending/featured products (first 8 for demo)
  const featuredProducts = React.useMemo(() => {
    return products
      .filter(product => product.rating >= 4.0)
      .slice(0, 8);
  }, [products]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (featuredProducts.length === 0) return null;

  const handleProductClick = (productId: string) => {
    navigate(`/shop/product/${productId}`);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Trending Now
          </h2>
          <p className="text-sm text-muted-foreground">
            Popular products shoppers are buying today
          </p>
        </div>
        <Button variant="outline" className="hidden sm:flex items-center gap-2">
          View All <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Horizontal scrolling product carousel */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="flex-shrink-0 w-36 sm:w-40 cursor-pointer group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
              onClick={() => handleProductClick(product.id)}
            >
              <CardContent className="p-3 space-y-2">
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-50">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!product.inStock && (
                    <Badge className="absolute top-1 left-1 text-xs bg-red-500 text-white">
                      Out of Stock
                    </Badge>
                  )}
                  {product.rating >= 4.5 && (
                    <Badge className="absolute top-1 right-1 text-xs bg-green-500 text-white">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {product.rating}
                    </Badge>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${product.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Quick view functionality
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart functionality
                        }}
                      >
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="sm:hidden mt-3 text-center">
          <Button variant="outline" size="sm" className="w-full">
            View All Trending Products <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
