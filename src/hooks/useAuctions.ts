import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Auction } from '@/types/unified';

export const useAuctions = () => {
  return useQuery({
    queryKey: ['auctions'],
    queryFn: async () => {
      console.log('Fetching auctions from Supabase...');
      
      try {
        const { data: auctionsData, error: auctionsError } = await supabase
          .from('auctions')
          .select('*')
          .order('end_time', { ascending: true });

        if (auctionsError) {
          console.error('Error fetching auctions:', auctionsError);
          throw auctionsError;
        }

        if (!auctionsData || auctionsData.length === 0) {
          console.warn('No auctions found in database');
          return [];
        }

        console.log('Fetched auctions:', auctionsData);

        // Transform the data to match our Auction type with comprehensive fallbacks
        const auctions: Auction[] = auctionsData.map((auction) => {
          // Ensure all required fields have fallbacks
          const safeAuction: Auction = {
            id: auction.id ?? '',
            title: auction.title || 'Untitled Auction',
            currentBid: Number(auction.current_bid) || 0,
            startingBid: Number(auction.starting_bid) || 0,
            endTime: auction.end_time ? new Date(auction.end_time) : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24h from now
            bidders: Number(auction.bidders) || 0,
            // Use category_name if available, fallback to enum category, then to 'electronics'
            category: auction.category_name || auction.category || 'electronics',
            condition: auction.condition || 'good',
            image: auction.image || '',
            slug: auction.slug || undefined,
            created_at: auction.created_at || new Date().toISOString(),
            updated_at: auction.updated_at || new Date().toISOString()
          };

          return safeAuction;
        });

        return auctions;
      } catch (error) {
        console.error('Failed to fetch auctions:', error);
        // Return empty array instead of throwing to prevent app crashes
        return [];
      }
    },
    retry: (failureCount, error: any) => {
      if (error?.code && error.code >= 400 && error.code < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'offlineFirst',
  });
};
