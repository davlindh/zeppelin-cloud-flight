
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/marketplace/WishlistContext';
import { useAuctions } from '@/hooks/marketplace/useAuctions';

export const useAuctionNotifications = () => {
  const { toast } = useToast();
  const { state: wishlistState } = useWishlist();
  const { data: allAuctions = [] } = useAuctions();

  useEffect(() => {
    // Get auction IDs from wishlist items that are specifically auctions
    const watchedAuctionIds = wishlistState.items
      .filter(item => item.itemType === 'auction' || !item.itemType) // Include legacy items without itemType
      .map(item => item.productId)
      .filter(id => allAuctions.some(auction => auction.id === id));

    if (watchedAuctionIds.length === 0) return;

    const checkAuctionStatus = () => {
      const watchedAuctionsList = allAuctions.filter(auction => 
        watchedAuctionIds.includes(auction.id)
      );

      watchedAuctionsList.forEach(auction => {
        const timeLeft = auction.endTime.getTime() - new Date().getTime();
        const hoursLeft = timeLeft / (1000 * 60 * 60);
        const minutesLeft = timeLeft / (1000 * 60);

        // Only show notifications for active auctions
        if (timeLeft <= 0) return;

        // Notify when auction is ending soon (1 hour left)
        if (hoursLeft <= 1 && hoursLeft > 0.95 && minutesLeft > 55) {
          toast({
            title: "Auction Ending Soon!",
            description: `"${auction.title}" ends in less than 1 hour. Current bid: $${auction.currentBid.toLocaleString()}`,
            duration: 8000,
          });
        }

        // Notify when auction is ending very soon (10 minutes left)
        if (minutesLeft <= 10 && minutesLeft > 9) {
          toast({
            title: "Last Chance!",
            description: `"${auction.title}" ends in 10 minutes! Don't miss out.`,
            duration: 10000,
          });
        }
      });
    };

    // Check immediately
    checkAuctionStatus();

    // Set up interval to check every minute
    const interval = setInterval(checkAuctionStatus, 60000);

    return () => clearInterval(interval);
  }, [wishlistState.items, toast, allAuctions]);
};
