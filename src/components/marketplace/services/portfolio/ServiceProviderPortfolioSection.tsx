import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Star, Grid3x3, LayoutGrid } from 'lucide-react';
import { useServicePortfolio } from '@/hooks/marketplace/useServicePortfolio';
import { PortfolioMasonryGrid } from './PortfolioMasonryGrid';
import { PortfolioItemCard } from './PortfolioItemCard';
import { PortfolioDetailModal } from './PortfolioDetailModal';
import type { ServicePortfolioItem } from '@/types/unified';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceProviderPortfolioSectionProps {
  providerId: string;
  showFilters?: boolean;
  layout?: 'masonry' | 'grid';
}

const PortfolioSectionSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  </div>
);

export const ServiceProviderPortfolioSection: React.FC<ServiceProviderPortfolioSectionProps> = ({ 
  providerId,
  showFilters = true,
  layout: initialLayout = 'masonry'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ServicePortfolioItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [layout, setLayout] = useState<'masonry' | 'grid'>(initialLayout);
  
  const { 
    portfolioItems, 
    featuredItems,
    categories, 
    isLoading,
    filterByCategory,
    filterByTags
  } = useServicePortfolio(providerId);
  
  // Apply filters
  const filteredItems = useMemo(() => {
    let items = filterByCategory(selectedCategory);
    if (selectedTags.length > 0) {
      items = filterByTags(selectedTags);
    }
    return items;
  }, [selectedCategory, selectedTags, filterByCategory, filterByTags]);
  
  const handleItemClick = (item: ServicePortfolioItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };
  
  if (isLoading) {
    return <PortfolioSectionSkeleton />;
  }
  
  if (!portfolioItems || portfolioItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Portfolio Yet</h3>
          <p className="text-muted-foreground">
            This provider hasn't added portfolio items yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6" id="portfolio-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            Portfolio
          </h2>
          <p className="text-muted-foreground">
            {portfolioItems.length} projects completed
          </p>
        </div>
        
        {/* Layout Toggle */}
        <div className="flex gap-2">
          <Button
            variant={layout === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setLayout('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={layout === 'masonry' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setLayout('masonry')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Featured Items Carousel */}
      {featuredItems.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Featured Projects
          </h3>
          <div className="relative">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
                {featuredItems.map((item) => (
                  <div key={item.id} className="w-80 shrink-0">
                    <PortfolioItemCard 
                      item={item} 
                      onViewDetails={handleItemClick}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
      
      {/* Filters */}
      {showFilters && categories.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All ({portfolioItems.length})
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat} ({filterByCategory(cat).length})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Portfolio Grid/Masonry */}
      {layout === 'masonry' ? (
        <PortfolioMasonryGrid 
          items={filteredItems} 
          onItemClick={handleItemClick}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <PortfolioItemCard 
              key={item.id}
              item={item} 
              onViewDetails={handleItemClick}
            />
          ))}
        </div>
      )}
      
      {/* Detail Modal */}
      <PortfolioDetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};
