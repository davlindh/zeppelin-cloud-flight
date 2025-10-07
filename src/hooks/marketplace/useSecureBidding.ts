import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InputSanitizer, RateLimiter } from '@/utils/marketplace/inputSanitization';
import { supabase } from '@/integrations/supabase/client';

interface BidSubmission {
  email: string;
  name: string;
  amount: number;
}

export const useSecureBidding = (auctionId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitSecureBid = async (bidData: BidSubmission): Promise<void> => {
    console.log('🎯 Starting bid submission for auction:', auctionId, 'Amount:', bidData.amount);
    
    if (isSubmitting) {
      console.log('⚠️ Already submitting bid, preventing duplicate submission');
      return;
    }

    // Validate auction ID
    if (!auctionId || auctionId.trim() === ') {
      console.error('❌ Invalid auction ID:', auctionId);
      toast({
        title: "Invalid Auction",
        description: "Auction ID is missing. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    const rateLimitKey = `bid_${auctionId}_${bidData.email}`;
    if (!RateLimiter.canAttempt(rateLimitKey, 3, 60000)) { // 3 bids per minute
      console.log('⛔ Rate limit exceeded for:', rateLimitKey);
      toast({
        title: "Too Many Bid Attempts",
        description: "Please wait before placing another bid.",
        variant: "destructive"
      });
      return;
    }

    // Input validation
    const contactValidation = InputSanitizer.validateContactInfo({
      name: bidData.name,
      email: bidData.email
    });

    if (!contactValidation.isValid) {
      console.log('❌ Contact validation failed:', contactValidation.errors);
      toast({
        title: "Invalid Input",
        description: contactValidation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    // Validate bid amount
    if (!bidData.amount || isNaN(bidData.amount) || bidData.amount <= 0 || bidData.amount > 1000000) {
      console.error('❌ Invalid bid amount:', bidData.amount);
      toast({
        title: "Invalid Bid Amount", 
        description: "Bid amount must be a valid number between $1 and $1,000,000",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize input data
      const sanitizedData = {
        email: bidData.email.toLowerCase().trim(),
        name: InputSanitizer.sanitizeText(bidData.name, 100),
        amount: Math.round(bidData.amount * 100) / 100 // Round to 2 decimal places
      };

      console.log('🧹 Sanitized bid data:', {
        email: sanitizedData.email,
        name: sanitizedData.name,
        amount: sanitizedData.amount
      });

      // Create masked bidder string for privacy
      const maskedEmail = sanitizedData.email.substring(0, 3) + '****';
      const bidderString = `${sanitizedData.name} (${maskedEmail})`;

      console.log('📡 Calling place_bid RPC with:', {
        p_auction_id: auctionId,
        p_bidder: bidderString,
        p_amount: sanitizedData.amount
      });

      // Use the secure database function
      const { data, error } = await supabase.rpc('place_bid', {
        p_auction_id: auctionId,
        p_bidder: bidderString,
        p_amount: sanitizedData.amount
      });

      console.log('📬 RPC Response:', { data, error });

      if (error) {
        console.error('❌ Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      const result = data?.[0] as { success: boolean; message: string } | undefined;
      if (!result?.success) {
        const errorMsg = result?.message || 'Failed to place bid';
        console.error('❌ Bid placement failed:', errorMsg, 'Full result:', result);
        throw new Error(errorMsg);
      }

      console.log('✅ Bid placed successfully:', result);

      // Store bid info securely in localStorage for user tracking
      const bidInfo = {
        auctionId,
        email: sanitizedData.email,
        lastBidAmount: sanitizedData.amount,
        timestamp: Date.now()
      };
      localStorage.setItem('lastBidInfo', JSON.stringify(bidInfo));

      toast({
        title: "Bid Placed Successfully!",
        description: `Your bid of $${sanitizedData.amount.toLocaleString()} has been submitted.`,
      });

    } catch (error) {
      console.error('💥 Secure bidding error:', error);
      
      let errorMessage = 'There was an error placing your bid. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('auction has ended')) {
          errorMessage = 'This auction has ended. You can no longer place bids.';
        } else if (error.message.includes('bid amount')) {
          errorMessage = 'Your bid amount is too low. Please check the minimum bid requirement.';
        } else if (error.message.includes('Minimum bid increment')) {
          errorMessage = error.message; // Use the exact message from the database
        } else if (error.message.includes('higher than current bid')) {
          errorMessage = error.message; // Use the exact message from the database
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Database error')) {
          errorMessage = 'There was a database error. Please try again in a moment.';
        }
      }
      
      toast({
        title: "Bid Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUserHighestBidder = (email: string): boolean => {
    try {
      const storedBidInfo = localStorage.getItem('lastBidInfo');
      if (!storedBidInfo) return false;
      
      const bidInfo = JSON.parse(storedBidInfo);
      return bidInfo.auctionId === auctionId && 
             bidInfo.email?.toLowerCase() === email.toLowerCase();
    } catch {
      return false;
    }
  };

  return {
    submitSecureBid,
    isSubmitting,
    isUserHighestBidder
  };
};