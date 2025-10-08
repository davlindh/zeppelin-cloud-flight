import { useQueryClient } from '@tanstack/react-query';
import { useSecureBidding } from './useSecureBidding';

interface BidSubmission {
  email: string;
  name: string;
  amount: number;
}

interface AuctionSnapshot {
  current_bid?: number;
  bidders?: number;
  bidHistory?: Array<{
    bidder: string;
    amount: number;
    time: string;
  }>;
}

export const useRealTimeBidding = (idOrSlug: string, auctionId?: string) => {
  const queryClient = useQueryClient();
  const { submitSecureBid, isSubmitting, isUserHighestBidder } = useSecureBidding(
    auctionId || ''
  );

  const submitBid = async (bidData: BidSubmission): Promise<void> => {
    console.log('[useRealTimeBidding] Bid submission initiated:', {
      idOrSlug,
      auctionId,
      amount: bidData.amount,
    });

    if (!auctionId) {
      const message = 'Auction ID not resolved yet. Please wait a moment and try again.';
      console.error('[useRealTimeBidding] Missing auction ID for bid submission');
      throw new Error(message);
    }

    try {
      queryClient.setQueryData(['auction-detail', idOrSlug], (oldData: AuctionSnapshot | null) => {
        if (!oldData) {
          return oldData;
        }

        const obfuscatedBidder = `${bidData.name} (${bidData.email.substring(0, 3)}****)`;
        const newHistoryEntry = {
          bidder: obfuscatedBidder,
          amount: bidData.amount,
          time: new Date().toISOString(),
        };

        return {
          ...oldData,
          current_bid: bidData.amount,
          bidders: (oldData.bidders ?? 0) + 1,
          bidHistory: [newHistoryEntry, ...(oldData.bidHistory ?? [])],
        };
      });

      await submitSecureBid(bidData);

      await queryClient.invalidateQueries({ queryKey: ['auction-detail', idOrSlug] });

      console.log('[useRealTimeBidding] Bid submission completed successfully');
    } catch (error) {
      console.error('[useRealTimeBidding] Bid submission failed:', error);
      await queryClient.invalidateQueries({ queryKey: ['auction-detail', idOrSlug] });
      throw error;
    }
  };

  return {
    isSubmitting,
    submitBid,
    isUserHighestBidder,
  };
};
