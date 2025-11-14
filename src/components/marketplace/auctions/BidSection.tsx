import React, { useState } from 'react';
import { Heart, Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountdownTimer } from './CountdownTimer';
import { StandardizedBidDialog } from './StandardizedBidDialog';
import { useWishlist } from '@/contexts/marketplace/WishlistContext';
import { useRealTimeBidding } from '@/hooks/marketplace/useRealTimeBidding';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency';

interface BidSectionProps {
  slug: string;
  auctionId: string;
  currentBid: number;
  startingBid: number;
  endTime: Date;
  bidders: number;
  isEnded?: boolean;
  title?: string;
}

export const BidSection: React.FC<BidSectionProps> = ({
  slug,
  auctionId,
  currentBid,
  startingBid,
  endTime,
  bidders,
  isEnded = false,
  title = "Auction Item"
}) => {
  const [showBidDialog, setShowBidDialog] = useState(false);
  const { isInWishlist, addItem, removeItem } = useWishlist();
  const { submitBid, isSubmitting } = useRealTimeBidding(slug, auctionId);
  const { toast } = useToast();
  const { t } = useTranslation();

  const isWatching = isInWishlist(auctionId);
  const timeLeft = endTime.getTime() - new Date().getTime();
  const actuallyEnded = timeLeft <= 0 || isEnded;

  const handleBidSubmit = async (bidData: { email: string; name: string; amount: number }) => {
    try {
      await submitBid(bidData);
      setShowBidDialog(false);
    } catch (_error) {
      console.error('Bid submission failed:', _error);
    }
  };

  const handleToggleWatch = () => {
    if (isWatching) {
      removeItem(auctionId);
      toast({
        title: t('auctions.removedFromSaved'),
        description: `"${title}" ${t('auctions.itemRemovedFromSaved')}`,
      });
    } else {
      addItem(auctionId, 'auction');
      toast({
        title: t('auctions.addedToSaved'),
        description: `"${title}" ${t('auctions.itemAddedToSaved')}`,
      });
    }
  };

  const handleShare = async () => {
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    // Use slug-based URL for sharing (SEO-friendly)
    const shareUrl = `${window.location.origin}/marketplace/auctions/${slug}`;
    
    const shareData = {
      title: `${title} - ${t('auctions.liveAuctions')}`,
      text: `${t('auctions.shareAuction')}! ${t('auctions.currentBid')}: ${formatCurrency(currentBid)}. ${
        actuallyEnded 
          ? t('auctions.auctionEnded')
          : hoursLeft > 0 
            ? `${hoursLeft}h ${minutesLeft}m ${t('auctions.timeLeft').toLowerCase()}` 
            : `${minutesLeft}m ${t('auctions.timeLeft').toLowerCase()}`
      }.`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: t('auctions.linkCopied'),
          description: t('auctions.auctionDetailsCopied'),
        });
      }
    } catch (_error) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: t('auctions.linkCopied'),
          description: t('auctions.auctionUrlCopied'),
        });
      } catch (_clipboardError) {
        toast({
          title: t('auctions.shareFailed'),
          description: t('auctions.shareFailedDescription'),
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {actuallyEnded ? t('auctions.auctionEnded') : t('auctions.currentBid')}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-3xl font-bold ${actuallyEnded ? 'text-slate-600' : 'text-blue-600'}`}>
                {formatCurrency(currentBid)}
              </p>
              <p className="text-sm text-slate-600">
                {t('auctions.startingBid')}: {formatCurrency(startingBid)}
              </p>
            </div>
            <div className="text-right">
              <CountdownTimer endTime={endTime} className="mb-1" />
              <div className="flex items-center text-slate-600">
                <Users className="h-4 w-4 mr-1" />
                <span>{bidders} {t('auctions.bidders').toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowBidDialog(true)}
              disabled={actuallyEnded || isSubmitting}
            >
              {actuallyEnded ? t('auctions.auctionEnded') : isSubmitting ? t('auctions.placingBid') : t('auctions.placeBid')}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={handleToggleWatch}
                className="flex items-center justify-center gap-2"
              >
                <Heart className={`h-4 w-4 ${isWatching ? 'fill-red-500 text-red-500' : ''}`} />
                {isWatching ? t('auctions.saved') : t('common.save')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                {t('product.share')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StandardizedBidDialog
        isOpen={showBidDialog}
        onClose={() => setShowBidDialog(false)}
        auctionId={auctionId}
        currentBid={currentBid}
        onBidSubmit={handleBidSubmit}
        isSubmitting={isSubmitting}
        endTime={endTime}
        />
    </>
  );
};
