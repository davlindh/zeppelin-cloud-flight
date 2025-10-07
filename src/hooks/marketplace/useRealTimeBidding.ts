
import { useSecureBidding } from './useSecureBidding';
import { useQueryClient } from '@tanstack/react-query';

interface BidSubmission {
  email: string;
  name: string;
  amount: number;
}


export const useRealTimeBidding = (idOrSlug: string, auctionId?: string) => {
  const queryClient = useQueryClient();
  const { submitSecureBid, isSubmitting, isUserHighestBidder } = useSecureBidding(auctionId || ');

  const submitBid = async (bidData: BidSubmission): Promise<void> => {
    console.log('🚀 Real-time bidding initiated:', { idOrSlug, auctionId, bidAmount: bidData.amount });
    
    if (!auctionId) {
      console.error('❌ Auction ID not resolved yet for:', idOrSlug);
      throw new Error('Auction ID not resolved yet. Please wait a moment and try again.');
    }

    try {
      // Optimistic update using consistent query key
      console.log('🔄 Applying optimistic update to auction data...');
      queryClient.setQueryData(['auction-detail', idOrSlug], (oldData: any) => {
        if (!oldData) {
          console.log('⚠️ No existing auction data for optimistic update');
          return oldData;
        }
        
        const newBidEntry = {
          bidder: `${bidData.name} (${bidData.email.substring(0, 3)}****)`,
          amount: bidData.amount,
          time: new Date().toISOString()
        };
        
        const updatedData = {
          ...oldData,
          current_bid: bidData.amount,
          bidders: (oldData as any).bidders ? (oldData as any).bidders + 1 : 1,
          bidHistory: [newBidEntry, ...((oldData as any).bidHistory ?? [])]
        };
        
        console.log('✅ Optimistic update applied:', {
          newCurrentBid: updatedData.current_bid,
          newBidderCount: updatedData.bidders
        });
        
        return updatedData;
      });

      // Use secure bidding with validation and rate limiting
      console.log('📤 Submitting secure bid...');
      await submitSecureBid(bidData);

      // Force refetch to get the latest data from database
      console.log('🔄 Invalidating queries to fetch fresh data...');
      await queryClient.invalidateQueries({ queryKey: ['auction-detail', idOrSlug] });
      
      console.log('🎉 Bid submission completed successfully!');

    } catch (error) {
      console.error('💥 Real-time bidding error occurred:', error);
      
      // Rollback optimistic update on error
      console.log('🔄 Rolling back optimistic update due to error...');
      queryClient.invalidateQueries({ queryKey: ['auction-detail', idOrSlug] });
      
      throw error;
    }
  };

  return {
    isSubmitting,
    submitBid,
    isUserHighestBidder
  };
};
