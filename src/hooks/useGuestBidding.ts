
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GuestBid {
  auctionId: string; // Changed from number to string
  email: string;
  name: string;
  amount: number;
  timestamp: Date;
  id: string;
}

interface BidSubmission {
  email: string;
  name: string;
  amount: number;
}

export const useGuestBidding = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getGuestBids = (): GuestBid[] => {
    try {
      const saved = localStorage.getItem('guestBids');
      if (saved) {
        const bids = JSON.parse(saved);
        return bids.map((bid: any) => ({
          ...bid,
          timestamp: new Date(bid.timeStamp || bid.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading guest bids:', error);
    }
    return [];
  };

  const getAuctionBids = (auctionId: string): GuestBid[] => {
    return getGuestBids().filter(bid => bid.auctionId === auctionId);
  };

  const getUserBids = (email: string): GuestBid[] => {
    return getGuestBids().filter(bid => bid.email.toLowerCase() === email.toLowerCase());
  };

  const isUserHighestBidder = (auctionId: string, email: string, currentBid: number): boolean => {
    const userBids = getAuctionBids(auctionId).filter(
      bid => bid.email.toLowerCase() === email.toLowerCase()
    );
    
    if (userBids.length === 0) return false;
    
    const highestUserBid = Math.max(...userBids.map(bid => bid.amount));
    return highestUserBid === currentBid;
  };

  const submitBid = async (auctionId: string, bidData: BidSubmission): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBid: GuestBid = {
        auctionId,
        ...bidData,
        timestamp: new Date(),
        id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const existingBids = getGuestBids();
      const updatedBids = [...existingBids, newBid];
      
      localStorage.setItem('guestBids', JSON.stringify(updatedBids));
      
      // Store last bid email for user identification
      localStorage.setItem('lastBidEmail', bidData.email);

      toast({
        title: "Bid Placed Successfully!",
        description: `Your bid of $${bidData.amount.toLocaleString()} has been submitted.`,
      });

    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: "Bid Failed",
        description: "There was an error placing your bid. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitBid,
    getGuestBids,
    getAuctionBids,
    getUserBids,
    isUserHighestBidder
  };
};
