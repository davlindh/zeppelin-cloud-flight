
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/marketplace/auctions/CountdownTimer';
import { FloatingActionButtons } from '@/components/marketplace/ui/floating-action-buttons';
import { useQuickActions } from '@/hooks/marketplace/useQuickActions';
import { getResponsiveImageUrl, getImageAlt } from '@/utils/marketplace/imageUtils';
import { cn } from '@/lib/utils';

interface EnhancedAuctionCardProps {
  id: string;
  title: string;
  currentBid: number;
  startingBid: number;
  endTime: Date;
  bidders: number;
  image: string;
  category: string;
  condition: string;
  href?: string;
  onQuickView?: () => void;
}

export const EnhancedAuctionCard: React.FC<EnhancedAuctionCardProps> = ({
  id,
  title,
  currentBid,
  startingBid,
  endTime,
  bidders,
  image,
  category,
  condition,
  href = `/marketplace/auctions/${id}`,
  onQuickView
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const {
    isWatching,
    isSharing,
    handleToggleWatch,
    handleQuickView,
    handleShare
  } = useQuickActions({
    itemId: id,
    itemType: 'auction',
    itemTitle: title,
    currentBid,
    onQuickView
  });

  const isHot = bidders >= 10;
  const timeLeft = endTime.getTime() - Date.now();
  const isEndingSoon = timeLeft <= 3600000; // Less than 1 hour

  return (
    <Link to={href}>
      <Card className="group relative overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:shadow-black/10 border-0 bg-white rounded-2xl">
        {/* Floating Action Buttons */}
        <FloatingActionButtons
          isWatching={isWatching}
          isSharing={isSharing}
          onToggleWatch={handleToggleWatch}
          onQuickView={handleQuickView}
          onShare={handleShare}
        />

        <CardHeader className="p-0">
          {/* Auction Image */}
          <div className="relative aspect-square overflow-hidden rounded-t-2xl">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-200 animate-pulse" />
            )}
            
            <picture>
              <source 
                media="(max-width: 640px)" 
                srcSet={getResponsiveImageUrl(image)} 
              />
              <source 
                media="(max-width: 1024px)" 
                srcSet={getResponsiveImageUrl(image)} 
              />
              <img 
                src={getResponsiveImageUrl(image)} 
                alt={getImageAlt(title, 'auction')}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
              />
            </picture>

            {/* Hot/Ending Soon Badge - Top Center */}
            {(isHot || isEndingSoon) && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <Badge className={cn(
                  "text-xs text-white shadow-lg border-0 backdrop-blur-sm",
                  isEndingSoon ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-orange-500 hover:bg-orange-600"
                )}>
                  {isEndingSoon ? "⏰ Ending Soon" : "🔥 Hot"}
                </Badge>
              </div>
            )}

            {/* Condition Badge - Bottom Left */}
            <div className="absolute bottom-4 left-4 z-20">
              <Badge 
                variant="outline" 
                className="text-xs shadow-lg bg-white/95 backdrop-blur-sm border-0 text-blue-700"
              >
                {condition}
              </Badge>
            </div>

            {/* Category Badge - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-20">
              <Badge 
                variant="outline" 
                className="text-xs capitalize shadow-lg bg-white/95 backdrop-blur-sm border-0 text-slate-700"
              >
                {category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Auction Title */}
          <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
            {title}
          </CardTitle>

          {/* Bidding Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Starting bid:</span>
              <span className="font-medium">${startingBid.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Current bid:</span>
              <span className="text-2xl font-bold text-blue-600">
                ${currentBid.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <CountdownTimer endTime={endTime} />
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Users className="h-4 w-4" />
                <span>{bidders} bidders</span>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <Button className="w-full h-12 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
            View Auction
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};
