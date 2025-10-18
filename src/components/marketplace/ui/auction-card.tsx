import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/marketplace/auctions/CountdownTimer';
import { EnhancedBidDialog } from '@/components/marketplace/auctions/EnhancedBidDialog';
import { FloatingActionButtons } from '@/components/marketplace/ui/floating-action-buttons';
import { EnhancedStatusBadges } from '@/components/marketplace/auctions/EnhancedStatusBadges';
import { AuctionAnalyticsDisplay } from '@/components/marketplace/auctions/AuctionAnalyticsDisplay';
import { useQuickActions } from '@/hooks/marketplace/useQuickActions';
import { useGuestBidding } from '@/hooks/marketplace/useGuestBidding';
import { useCategoryInfo } from '@/utils/marketplace/dynamicCategoryUtils';
import { getResponsiveImageUrl, getImageAlt } from '@/utils/marketplace/imageUtils';
import { 
  calculateAuctionAnalytics, 
  getEnhancedStatus, 
  getConditionStyling 
} from '@/utils/marketplace/auctionUtils';
import { cn } from '@/lib/utils';

interface AuctionCardProps {
  id: string;
  title: string;
  currentBid: number;
  startingBid: number;
  endTime: Date;
  bidders: number;
  category: string;
  condition: string;
  image?: string;
  slug?: string;
  created_at?: string;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  title,
  currentBid,
  startingBid,
  endTime,
  bidders,
  category,
  condition,
  image,
  slug,
  created_at
}) => {
  const [showBidDialog, setShowBidDialog] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { submitBid, isSubmitting } = useGuestBidding();

  // Get dynamic category information with comprehensive fallbacks
  const { colors: categoryColors, displayName: categoryDisplayName, icon: categoryIcon, isFromDatabase } = useCategoryInfo(category || 'electronics');

  // Ensure all required data has safe defaults
  const safeTitle = title || 'Untitled Auction';
  const safeCurrentBid = Number(currentBid) || 0;
  const safeStartingBid = Number(startingBid) || 0;
  const safeBidders = Number(bidders) || 0;
  const safeCategory = category || 'electronics';
  const safeCondition = condition || 'good';
  const safeEndTime = endTime instanceof Date ? endTime : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const safeCreatedAt = created_at || new Date().toISOString();

  // Calculate enhanced analytics and status with safe data
  const analytics = calculateAuctionAnalytics(safeCurrentBid, safeStartingBid, safeBidders, safeEndTime, safeCreatedAt);
  const status = getEnhancedStatus(analytics, safeCondition, safeCategory);
  const conditionStyling = getConditionStyling(safeCondition);

  // Use slug for URL if available, otherwise fall back to ID
  const href = slug ? `/marketplace/auctions/${slug}` : `/marketplace/auctions/${id}`;

  const {
    isWatching,
    isSharing,
    handleToggleWatch,
    handleShare
  } = useQuickActions({
    itemId: id,
    itemType: 'auction',
    itemTitle: safeTitle,
    currentBid: safeCurrentBid,
    onQuickView: () => setShowBidDialog(true)
  });

  const handleQuickBid = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBidDialog(true);
  };

  const handleQuickView = () => {
    setShowBidDialog(true);
  };

  const handleBidSubmit = async (bidData: { email: string; name: string; amount: number }) => {
    try {
      await submitBid(id, bidData);
      setShowBidDialog(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Calculate if auction is hot or ending soon
  const isHot = safeBidders >= 10;
  const timeLeft = safeEndTime.getTime() - new Date().getTime();
  const isEndingSoon = timeLeft <= 3600000; // Less than 1 hour

  return (
    <>
      <Link to={href}>
        <Card className={cn(
          "group relative overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:shadow-black/10 border-0 bg-white rounded-2xl",
          conditionStyling.ring,
          conditionStyling.bg
        )}>
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
                  alt={getImageAlt(safeTitle, 'auction')}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getResponsiveImageUrl();
                  }}
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
                  className={cn(
                    "text-xs shadow-lg bg-white/95 backdrop-blur-sm border-0",
                    safeCondition === 'new' || safeCondition === 'like-new' 
                      ? 'text-emerald-700' 
                      : safeCondition === 'good' 
                      ? 'text-blue-700'
                      : 'text-slate-700'
                  )}
                >
                  {safeCondition}
                </Badge>
              </div>

              {/* Status Badge - Bottom Right */}
              <div className="absolute bottom-4 right-4 z-20">
                <EnhancedStatusBadges analytics={analytics} status={status} />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {/* Category */}
            <Badge 
              variant="outline" 
              className={cn("text-xs capitalize w-fit", categoryColors.bg, categoryColors.text, categoryColors.border)}
              title={isFromDatabase ? 'Category from database' : 'Fallback category'}
            >
              <span className="mr-1">{categoryIcon}</span>
              {categoryDisplayName}
            </Badge>
            
            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {safeTitle}
            </CardTitle>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Starting bid:</span>
                  <span className="font-medium">${safeStartingBid.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current bid:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">
                      ${safeCurrentBid.toLocaleString()}
                    </span>
                    {analytics.valueAppreciation > 0 && (
                      <span className="text-xs text-green-600 block">
                        +{analytics.valueAppreciation.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <AuctionAnalyticsDisplay 
                analytics={analytics}
                currentBid={safeCurrentBid}
                startingBid={safeStartingBid}
                createdAt={safeCreatedAt}
                endTime={safeEndTime}
              />
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <CountdownTimer endTime={safeEndTime} />
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>{safeBidders} bidders</span>
                </div>
              </div>
            </div>
            
            <Button 
              className={cn(
                "w-full h-12 rounded-xl font-medium text-white transition-all duration-200",
                status.urgency === 'critical' 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : status.urgency === 'high'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
              onClick={handleQuickBid}
            >
              {status.urgency === 'critical' ? 'BID NOW!' : 'Place Bid'}
            </Button>
          </CardContent>
        </Card>
      </Link>

      <EnhancedBidDialog
        isOpen={showBidDialog}
        onClose={() => setShowBidDialog(false)}
        auctionId={id}
        currentBid={safeCurrentBid}
        onBidSubmit={handleBidSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
