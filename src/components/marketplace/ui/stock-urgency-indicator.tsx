
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { AlertTriangle, TrendingUp} from 'lucide-react';

interface StockUrgencyIndicatorProps {
  stockCount: number;
  isPopular?: boolean;
  recentViews?: number;
  className?: string;
}

export const StockUrgencyIndicator: React.FC<StockUrgencyIndicatorProps> = ({
  stockCount,
  isPopular = false,
  recentViews = 0,
  className = ''
}) => {
  const getUrgencyLevel = () => {
    if (stockCount === 0) return 'out-of-stock';
    if (stockCount <= 3) return 'critical';
    if (stockCount <= 10) return 'low';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();

  if (urgencyLevel === 'normal' && !isPopular && recentViews < 5) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Stock Urgency */}
      {urgencyLevel === 'critical' && (
        <Badge variant="destructive" className="text-xs animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Only {stockCount} left!
        </Badge>
      )}
      
      {urgencyLevel === 'low' && (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
          <Clock className="h-3 w-3 mr-1" />
          Low stock: {stockCount} remaining
        </Badge>
      )}

      {urgencyLevel === 'out-of-stock' && (
        <Badge variant="outline" className="text-xs text-red-600 border-red-300">
          Out of Stock
        </Badge>
      )}

      {/* Popularity Indicator */}
      {isPopular && stockCount > 0 && (
        <Badge className="text-xs bg-blue-500 hover:bg-blue-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          Trending
        </Badge>
      )}

      {/* Recent Views */}
      {recentViews >= 5 && (
        <Badge variant="outline" className="text-xs">
          👀 {recentViews} people viewing
        </Badge>
      )}
    </div>
  );
};
