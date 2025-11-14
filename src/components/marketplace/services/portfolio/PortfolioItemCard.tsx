import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Eye, Calendar, Briefcase } from 'lucide-react';
import type { ServicePortfolioItem } from '@/types/unified';
import { format } from 'date-fns';
import { useTrackPortfolioClick } from '@/hooks/marketplace/usePortfolioAnalytics';

interface PortfolioItemCardProps {
  item: ServicePortfolioItem;
  onViewDetails: (item: ServicePortfolioItem) => void;
  sessionId?: string;
}

export const PortfolioItemCard: React.FC<PortfolioItemCardProps> = ({ 
  item, 
  onViewDetails,
  sessionId
}) => {
  const trackClick = useTrackPortfolioClick();

  const handleViewDetails = () => {
    // Track click
    trackClick.mutate({
      itemId: item.id,
      providerId: item.providerId,
      clickType: 'detail_view',
      sessionId
    });
    
    onViewDetails(item);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Featured badge */}
      {item.featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-amber-500">
            <Star className="w-3 h-3 mr-1" /> Featured
          </Badge>
        </div>
      )}
      
      {/* Main Image with overlay on hover */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={item.image} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleViewDetails}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
          <Badge variant="outline" className="ml-2 shrink-0">
            {item.category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>
        
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {item.projectDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(item.projectDate), 'MMM yyyy')}
            </span>
          )}
          {item.clientName && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {item.clientName}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
