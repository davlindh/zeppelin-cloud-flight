import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecentlyViewed } from '@/hooks/marketplace/useRecentlyViewed';
import { formatCurrency } from '@/utils/currency';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface StickyRecentlyViewedProps {
  maxVisible?: number;
}

export const StickyRecentlyViewed: React.FC<StickyRecentlyViewedProps> = ({
  maxVisible = 6
}) => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();
  const { t } = useTranslation();

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="sticky top-24 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Clock className="h-4 w-4 text-primary" />
          {t('common.recentlyViewed')}
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearRecentlyViewed}
          className="h-6 text-xs hover:text-destructive"
        >
          {t('common.clearAll')}
        </Button>
      </div>

      {/* Compact Product List */}
      <div className="space-y-2">
        {recentlyViewed.slice(0, maxVisible).map((item) => (
          <Link 
            key={item.id} 
            to={`/shop/${item.id}`}
            className="group flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop&crop=center';
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium line-clamp-2 mb-1 text-foreground group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(item.price)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(item.viewedAt), { 
                  addSuffix: true,
                  locale: sv 
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* View More */}
      {recentlyViewed.length > maxVisible && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            +{recentlyViewed.length - maxVisible} {t('common.moreItems')}
          </p>
        </div>
      )}
    </div>
  );
};
