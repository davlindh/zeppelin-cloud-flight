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
import type { Auction } from '@/types/marketplace/unified';

interface AuctionCardProps {
  // Can accept full Auction object OR individual props for backwards compatibility
  auction?: Auction;
  
  // Individual props (for backwards compatibility)
  id?: string;
  title?: string;
  currentBid?: number;
  startingBid?: number;
  endTime?: Date;
  bidders?: number;
  category?: string;
  condition?: string;
  image?: string;
  slug?: string;
  created_at?: string;
  bidHistory?: any[];
  
  // Optional display
  variant?: 'default' | 'enhanced';
  href?: string;
  
  // Optional features
  showAnalytics?: boolean;
  showEnhancedStatus?: boolean;
  showBidDialog?: boolean;
  showQuickActions?: boolean;
  
  // Callbacks
  onQuickView?: () => void;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  id: propId,
  title: propTitle,
  currentBid: propCurrentBid,
  startingBid: propStartingBid,
  endTime: propEndTime,
  bidders: propBidders,
  category: propCategory,
  condition: propCondition,
  image: propImage,
  slug: propSlug,
  created_at: propCreatedAt,
  bidHistory: propBidHistory,
  variant = 'enhanced',
  href: propHref,
  showAnalytics = true,
  showEnhancedStatus = true,
  showBidDialog = true,
  showQuickActions = true,
  onQuickView
}) => {
  // Extract values from auction object OR use individual props
  const id = auction?.id || propId || '';
  const title = auction?.title || propTitle || 'Untitled Auction';
  const currentBid = auction?.currentBid || propCurrentBid || 0;
  const startingBid = auction?.startingBid || propStartingBid || 0;
  const endTime = auction?.endTime ? new Date(auction.endTime) : (propEndTime || new Date(Date.now() + 24 * 60 * 60 * 1000));
  const bidders = auction?.bidders || propBidders || 0;
  const category = auction?.category || propCategory || 'electronics';
  const condition = auction?.condition || propCondition || 'good';
  const image = auction?.image || propImage;
  const slug = auction?.slug || propSlug;
  const created_at = auction?.created_at || propCreatedAt || new Date().toISOString();
  const bidHistory = auction?.bidHistory || propBidHistory || [];

  const [showBidDialogState, setShowBidDialogState] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { submitBid, isSubmitting } = useGuestBidding();

  // Get dynamic category information
  const { colors: categoryColors, displayName: categoryDisplayName, icon: categoryIcon } = useCategoryInfo(category);

  // Calculate analytics and status
  const analytics = calculateAuctionAnalytics(currentBid, startingBid, bidders, endTime, created_at);
  const status = getEnhancedStatus(analytics, condition, category);
  const conditionStyling = getConditionStyling(condition);

  // Use provided href, slug, or fallback to ID
  const finalHref = propHref || (slug ? `/marketplace/auctions/${slug}` : `/marketplace/auctions/${id}`);

  const {
    isWatching,
    isSharing,
    handleToggleWatch,
    handleQuickView: handleQuickViewAction,
    handleShare
  } = useQuickActions({
    itemId: id,
    itemType: 'auction',
    itemTitle: title,
    currentBid: currentBid,
    onQuickView: onQuickView || (() => setShowBidDialogState(true))
  });

  const handleQuickBid = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBidDialogState(true);
  };

  const handleBidSubmit = async (bidData: { email: string; name: string; amount: number }) => {
    try {
      await submitBid(id, bidData);
      setShowBidDialogState(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Calculate if auction is hot or ending soon
  const isHot = bidders >= 10;
  const timeLeft = endTime.getTime() - new Date().getTime();
  const isEndingSoon = timeLeft <= 3600000;

  return (
    <>
      <Link to={finalHref}>
        <Card className={cn(
          "group relative overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:shadow-black/10 border-0 bg-white rounded-2xl",
          variant === 'enhanced' && conditionStyling.ring,
          variant === 'enhanced' && conditionStyling.bg
        )}>
          {/* Floating Action Buttons */}
          {showQuickActions && (
            <FloatingActionButtons
              isWatching={isWatching}
              isSharing={isSharing}
              onToggleWatch={handleToggleWatch}
              onQuickView={handleQuickViewAction}
              onShare={handleShare}
            />
          )}

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
                  onError={(e) => {
                    console.warn(`[AuctionCard] Image failed for: ${title}`);
                    e.currentTarget.src = '/placeholder.svg';
                    setImageLoaded(true);
                  }}
                />
              </picture>

              {/* Enhanced Status Badges */}
              {showEnhancedStatus && variant === 'enhanced' ? (
                <>
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
                        condition === 'new' || condition === 'like-new' 
                          ? 'text-emerald-700' 
                          : condition === 'good' 
                          ? 'text-blue-700'
                          : 'text-slate-700'
                      )}
                    >
                      {condition}
                    </Badge>
                  </div>

                  {/* Status Badge - Bottom Right */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <EnhancedStatusBadges analytics={analytics} status={status} />
                  </div>
                </>
              ) : (
                <>
                  {/* Simple badges for default variant */}
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

                  <div className="absolute bottom-4 left-4 z-20">
                    <Badge 
                      variant="outline" 
                      className="text-xs shadow-lg bg-white/95 backdrop-blur-sm border-0 text-blue-700"
                    >
                      {condition}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 right-4 z-20">
                    <Badge 
                      variant="outline" 
                      className="text-xs capitalize shadow-lg bg-white/95 backdrop-blur-sm border-0 text-slate-700"
                    >
                      {category}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {/* Category Badge - Enhanced variant only */}
            {variant === 'enhanced' && (
              <Badge 
                variant="outline" 
                className={cn("text-xs capitalize w-fit", categoryColors.bg, categoryColors.text, categoryColors.border)}
              >
                <span className="mr-1">{categoryIcon}</span>
                {categoryDisplayName}
              </Badge>
            )}
            
            {/* Auction Title */}
            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
              {title}
            </CardTitle>

            {/* Bidding Info */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Starting bid:</span>
                  <span className="font-medium">${startingBid.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current bid:</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">
                      ${currentBid.toLocaleString()}
                    </span>
                    {variant === 'enhanced' && analytics.valueAppreciation > 0 && (
                      <span className="text-xs text-green-600 block">
                        +{analytics.valueAppreciation.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Analytics Display - Enhanced variant only */}
              {showAnalytics && variant === 'enhanced' && (
                <AuctionAnalyticsDisplay 
                  analytics={analytics}
                  currentBid={currentBid}
                  startingBid={startingBid}
                  createdAt={created_at}
                  endTime={endTime}
                />
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <CountdownTimer endTime={endTime} />
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>{bidders} bidders</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            {showBidDialog ? (
              <Button 
                className={cn(
                  "w-full h-12 rounded-xl font-medium text-white transition-all duration-200",
                  variant === 'enhanced' && status.urgency === 'critical' 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : variant === 'enhanced' && status.urgency === 'high'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                )}
                onClick={handleQuickBid}
              >
                {variant === 'enhanced' && status.urgency === 'critical' ? 'BID NOW!' : 'Place Bid'}
              </Button>
            ) : (
              <Button className="w-full h-12 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
                View Auction
              </Button>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Enhanced Bid Dialog */}
      {showBidDialog && (
        <EnhancedBidDialog
          isOpen={showBidDialogState}
          onClose={() => setShowBidDialogState(false)}
          auctionId={id}
          currentBid={currentBid}
          onBidSubmit={handleBidSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};
