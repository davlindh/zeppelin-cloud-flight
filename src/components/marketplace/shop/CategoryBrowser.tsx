
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDynamicCategories } from '@/hooks/useDynamicCategories';
import { useCategoryStats } from '@/hooks/useCategoryStats';
import { getCategoryIconFromMetadata } from '@/utils/dynamicCategoryUtils';
import { cn } from '@/lib/utils';

export const CategoryBrowser: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useDynamicCategories();
  const { data: categoryStats = {}, isLoading: statsLoading, isError: statsError } = useCategoryStats();

  const isLoading = categoriesLoading || statsLoading;
  const hasError = categoriesError || statsError;

  // Filter categories to show only those with products
  const categoriesWithProducts = React.useMemo(() => {
    return categories.filter(category => {
      const stats = categoryStats[category.name];
      return stats && stats.productCount > 0;
    });
  }, [categories, categoryStats]);

  const handleCategoryClick = (categoryName: string) => {
    console.log('CategoryBrowser: handleCategoryClick with:', categoryName);
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  if (hasError) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to Load Categories</h3>
        <p className="text-slate-600">There was an error loading category data. Please try refreshing the page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-3">
                <Skeleton className="h-20 rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Use the filtered categories with products
  const activeCategories = categoriesWithProducts;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Browse Categories</h3>
        <Badge variant="outline" className="text-xs px-2 py-1">
          {activeCategories.length} categories
        </Badge>
      </div>
      
      {/* Compact horizontal pill layout */}
      <div className="flex flex-wrap gap-2 justify-center">
        {activeCategories.map((category) => {
          const stats = categoryStats[category.name] || {
            productCount: 0,
            stockStatus: 'out' as const,
            isHot: false,
            hasNewArrivals: false,
            isComingSoon: false
          };
          
          const icon = getCategoryIconFromMetadata(category.metadata, category.name);
          
          return (
            <div
              key={category.id}
              className="group cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
            >
              <Badge
                variant="outline"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 h-10",
                  "border-2 hover:border-primary/50 active:scale-95",
                  "bg-white hover:bg-primary/5",
                  "transition-all duration-200 hover:shadow-md",
                  "group-hover:text-primary"
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  {typeof icon === 'string' ? (
                    <span className="text-sm">{icon}</span>
                  ) : (
                    React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4" })
                  )}
                </div>
                
                {/* Category name and count */}
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm">{category.display_name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({stats.productCount || 0})
                  </span>
                </div>
                
                {/* Hot badge */}
                {stats.isHot && (
                  <span className="text-xs">🔥</span>
                )}
              </Badge>
            </div>
          );
        })}
      </div>
      
      {activeCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <span className="text-4xl">📦</span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Categories Available</h3>
          <p className="text-slate-600">Categories will appear here once products are added.</p>
        </div>
      )}
    </div>
  );
};
