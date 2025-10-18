
import React, { useState } from 'react';
import { Heart, Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountdownTimer } from './CountdownTimer';
import { StandardizedBidDialog } from './StandardizedBidDialog';
import { useWishlist } from '@/contexts/marketplace/WishlistContext';
import { useRealTimeBidding } from '@/hooks/marketplace/useRealTimeBidding';
import { useToast } from '@/hooks/use-toast';

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
        title: "Removed from saved items",
        description: `"${title}" has been removed from your saved items.`,
      });
    } else {
      addItem(auctionId, 'auction');
      toast({
        title: "Added to saved items",
        description: `"${title}" has been added to your saved items for tracking.`,
      });
    }
  };

  const handleShare = async () => {
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    // Use slug-based URL for sharing (SEO-friendly)
    const shareUrl = `${window.location.origin}/marketplace/auctions/${slug}`;
    
    const shareData = {
      title: `${title} - Live Auction`,
      text: `Check out this auction! Current bid: $${currentBid.toLocaleString()}. ${
        actuallyEnded 
          ? 'Auction ended' 
          : hoursLeft > 0 
            ? `${hoursLeft}h ${minutesLeft}m remaining` 
            : `${minutesLeft}m remaining`
      }.`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copied!",
          description: "Auction details have been copied to your clipboard.",
        });
      }
    } catch (_error) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Auction URL has been copied to your clipboard.",
        });
      } catch (_clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy the auction link.",
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
              {actuallyEnded ? 'Auction Ended' : 'Current Bid'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-3xl font-bold ${actuallyEnded ? 'text-slate-600' : 'text-blue-600'}`}>
                ${currentBid.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">
                Starting bid: ${startingBid.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <CountdownTimer endTime={endTime} className="mb-1" />
              <div className="flex items-center text-slate-600">
                <Users className="h-4 w-4 mr-1" />
                <span>{bidders} bidders</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowBidDialog(true)}
              disabled={actuallyEnded || isSubmitting}
            >
              {actuallyEnded ? 'Auction Ended' : isSubmitting ? 'Placing Bid...' : 'Place Bid'}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={handleToggleWatch}
                className="flex items-center justify-center gap-2"
              >
                <Heart className={`h-4 w-4 ${isWatching ? 'fill-red-500 text-red-500' : ''}`} />
                {isWatching ? 'Saved' : 'Save'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
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
