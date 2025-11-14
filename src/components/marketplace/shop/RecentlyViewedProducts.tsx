import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecentlyViewed } from '@/hooks/marketplace/useRecentlyViewed';
import { formatCurrency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface RecentlyViewedProductsProps {
  variant?: 'default' | 'horizontal' | 'compact';
  maxItems?: number;
  className?: string;
}

export const RecentlyViewedProducts: React.FC<RecentlyViewedProductsProps> = ({
  variant = 'default',
  maxItems,
  className
}) => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { t } = useTranslation();

  if (recentlyViewed.length === 0) return null;

  const displayCount = maxItems || (variant === 'compact' ? 4 : 6);
  const items = recentlyViewed.slice(0, displayCount);

  // Horizontal scroll variant for mobile
  if (variant === 'horizontal') {
    return (
      <div className={cn("mb-6", className)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Clock className="h-4 w-4 text-primary" />
            {t('common.recentlyViewed')}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearRecentlyViewed}
            className="text-xs"
          >
            {t('common.clearAll')}
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {items.map((item) => (
            <Link 
              key={item.id} 
              to={`/shop/${item.id}`}
              className="group flex-shrink-0 w-32"
            >
              <div className="bg-card border border-border rounded-lg p-2 hover:shadow-md transition-shadow">
                <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center';
                    }}
                  />
                </div>
                <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-1">
                  {item.title}
                </h4>
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Compact variant (fewer items, smaller cards)
  if (variant === 'compact') {
    return (
      <Card className={cn("mb-6", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {t('common.recentlyViewed')}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearRecentlyViewed}
              className="text-xs"
            >
              {t('common.clearAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {items.map((item) => (
              <Link 
                key={item.id} 
                to={`/shop/${item.id}`}
                className="group"
              >
                <div className="relative bg-card border border-border rounded-lg p-2 hover-lift transition-smooth">
                  <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-fast"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center';
                      }}
                    />
                  </div>
                  <h4 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant (original design)
  return (
    <Card className={cn("mb-8", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t('common.recentlyViewed')}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearRecentlyViewed}
          >
            {t('common.clearAll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
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
                    {formatCurrency(item.price)}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.viewedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {recentlyViewed.length > displayCount && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              +{recentlyViewed.length - displayCount} {t('common.moreItems')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
