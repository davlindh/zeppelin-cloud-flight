import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecentlyViewed } from '@/hooks/marketplace/useRecentlyViewed';

export const RecentlyViewedProducts: React.FC = () => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recently Viewed
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearRecentlyViewed}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentlyViewed.slice(0, 6).map((item) => (
            <Link 
              key={item.id} 
              to={`/shop/${item.id}`}
              className="group"
            >
              <div className="relative bg-card border border-border rounded-lg p-3 hover-lift transition-smooth">
                <div className="aspect-square bg-muted rounded-md mb-3 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-fast"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  
                  <p className="text-sm font-semibold text-foreground">
                    ${item.price.toLocaleString()}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.viewedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {recentlyViewed.length > 6 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              +{recentlyViewed.length - 6} more items viewed recently
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
