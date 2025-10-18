import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/marketplace/useProducts';
import { cn } from '@/lib/utils';
import { Star, TrendingUp } from 'lucide-react';

export const BrandShowcase: React.FC = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();

  // Extract brand data with statistics
  const brandData = React.useMemo(() => {
    const brandStats = products.reduce((acc, product) => {
      if (!product.brand) return acc;
      
      if (!acc[product.brand]) {
        acc[product.brand] = {
          name: product.brand,
          productCount: 0,
          totalReviews: 0,
          totalRating: 0,
          minPrice: Infinity,
          maxPrice: 0,
          products: []
        };
      }
      
      acc[product.brand].productCount++;
      acc[product.brand].totalReviews += product.reviews;
      acc[product.brand].totalRating += product.rating * product.reviews;
      acc[product.brand].minPrice = Math.min(acc[product.brand].minPrice, product.price);
      acc[product.brand].maxPrice = Math.max(acc[product.brand].maxPrice, product.price);
      acc[product.brand].products.push(product);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(brandStats)
      .map((brand: any) => ({
        ...brand,
        averageRating: brand.totalReviews > 0 ? brand.totalRating / brand.totalReviews : 0,
        featuredImage: brand.products[0]?.image || '',
        isPopular: brand.productCount >= 5,
        priceRange: brand.minPrice === brand.maxPrice 
          ? `$${brand.minPrice}` 
          : `$${brand.minPrice} - $${brand.maxPrice}`
      }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 12); // Show top 12 brands
  }, [products]);

  const handleBrandClick = (brandName: string) => {
    navigate(`/marketplace/shop/brand/${encodeURIComponent(brandName)}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (brandData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="heading-section mb-3">Shop by Brand</h2>
        <p className="text-body-large mb-2">
          Discover trusted brands and exclusive collections
        </p>
        <Badge variant="outline" className="px-3 py-1">
          {brandData.length} brands available
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {brandData.map((brand) => (
          <div
            key={brand.name}
            className="group cursor-pointer"
            onClick={() => handleBrandClick(brand.name)}
          >
            <Card className={cn(
              "card-base card-hover relative overflow-hidden h-full",
              "border hover:border-primary/50 active:scale-95",
              "bg-gradient-to-br from-white to-slate-50/50",
              "transform-gpu touch-target transition-all duration-200",
              "hover:shadow-lg"
            )}>
              <CardContent className="p-3 space-y-2">
                {/* Brand Image/Logo Area */}
                <div className="aspect-square w-full rounded-lg bg-slate-100 overflow-hidden relative">
                  {brand.featuredImage ? (
                    <img 
                      src={brand.featuredImage} 
                      alt={`${brand.name} products`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <span className="text-lg font-bold text-primary">
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Popular Badge */}
                  {brand.isPopular && (
                    <Badge className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>

                {/* Brand Name */}
                <h3 className={cn(
                  "font-medium text-sm text-center leading-tight",
                  "group-hover:text-primary transition-colors",
                  "text-slate-900 truncate"
                )}>
                  {brand.name}
                </h3>

                {/* Brand Stats */}
                <div className="text-center space-y-1">
                  <div className="text-xs text-slate-600">
                    {brand.productCount} products
                  </div>
                  
                  {brand.averageRating > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">
                        {brand.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-xs font-medium text-primary">
                    {brand.priceRange}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};