import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  Star,
  Eye,
  Settings,
  ExternalLink
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

const BrandManagement = () => {
  const { data: allProducts = [], isLoading } = useProducts();

  // Group products by brand and calculate statistics
  const brandStats = React.useMemo(() => {
    const brands = new Map();
    
    allProducts.forEach(product => {
      const brandName = product.brand || 'Unknown';
      
      if (!brands.has(brandName)) {
        brands.set(brandName, {
          name: brandName,
          products: [],
          totalProducts: 0,
          averageRating: 0,
          totalRevenue: 0,
          categories: new Set()
        });
      }
      
      const brand = brands.get(brandName);
      brand.products.push(product);
      brand.totalProducts++;
      brand.categories.add(product.categoryName);
    });
    
    // Calculate averages and totals
    brands.forEach((brand) => {
      brand.averageRating = brand.products.reduce((sum: number, p: any) => sum + p.rating, 0) / brand.totalProducts;
      brand.totalRevenue = brand.products.reduce((sum: number, p: any) => sum + (p.price * (p.reviews || 0)), 0);
      brand.categories = Array.from(brand.categories);
    });
    
    return Array.from(brands.values()).sort((a, b) => b.totalProducts - a.totalProducts);
  }, [allProducts]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brand Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brandStats.map((brand) => (
          <Card key={brand.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{brand.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {brand.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Brand Statistics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Products</p>
                  <p className="font-semibold">{brand.totalProducts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold">${brand.totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {brand.categories.slice(0, 3).map((category: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {brand.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{brand.categories.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  {brand.averageRating >= 4.5 ? 'Excellent' : 
                   brand.averageRating >= 4.0 ? 'Good' : 
                   brand.averageRating >= 3.5 ? 'Average' : 'Needs Improvement'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  asChild
                >
                  <a href={`/admin/brand/${encodeURIComponent(brand.name)}`}>
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a 
                    href={`/shop/brand/${encodeURIComponent(brand.name)}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{brandStats.length}</div>
              <p className="text-sm text-muted-foreground">Total Brands</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {brandStats.reduce((sum, brand) => sum + brand.totalProducts, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {brandStats.length > 0 ? 
                  (brandStats.reduce((sum, brand) => sum + brand.averageRating, 0) / brandStats.length).toFixed(1) : 
                  '0.0'
                }
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${brandStats.reduce((sum, brand) => sum + brand.totalRevenue, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Package className="h-4 w-4 mr-2" />
              Add New Brand
            </Button>
            <Button variant="outline" className="justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Brand Performance Report
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/shop" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Shop Frontend
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandManagement;