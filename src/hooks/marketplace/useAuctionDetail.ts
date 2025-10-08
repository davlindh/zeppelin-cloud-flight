
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type AuctionRow = Tables<'auctions'>;

export interface AuctionDetail extends Omit<AuctionRow, 'end_time'> {
  endTime: Date;
  bidHistory: Array<{ bidder: string; amount: number; time: string }>;
}

const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useAuctionDetail = (idOrSlug: string) => {
  const query = useQuery({
    queryKey: ['auction-detail', idOrSlug],
    queryFn: async (): Promise<AuctionDetail | null> => {
      console.log('🔍 Fetching auction by ID/slug:', idOrSlug);
      
      if (!idOrSlug || idOrSlug.trim() === '') {
        console.log('❌ Empty ID/slug provided');
        return null;
      }

      let auction: AuctionRow | null = null;
      let error: any = null;

      // Try different approaches based on the format of the identifier
      if (isValidUUID(idOrSlug)) {
        // If it's a valid UUID, try fetching by ID first
        console.log('📌 Trying UUID-based lookup for:', idOrSlug);
        const { data: auctionById, error: idError } = await supabase
          .from('auctions')
          .select('*')
          .eq('id', idOrSlug)
          .maybeSingle();

        auction = auctionById;
        error = idError;
      }

      // If not found by UUID or not a UUID, try by slug
      if (!auction && !error) {
        console.log('📌 Trying slug-based lookup for:', idOrSlug);
        const { data: auctionBySlug, error: slugError } = await supabase
          .from('auctions')
          .select('*')
          .eq('slug', idOrSlug)
          .maybeSingle();

        auction = auctionBySlug;
        error = slugError;
      }

      // If still not found and it looks like a numeric ID, we might need to handle legacy URLs
      if (!auction && !error && /^\d+$/.test(idOrSlug)) {
        console.log('📌 Numeric ID detected, but no matching auction found for:', idOrSlug);
        // For now, we'll return null rather than trying to convert numeric IDs
        // In a real system, you might want to redirect old URLs or have a mapping table
        return null;
      }

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      if (!auction) {
        console.log('❌ No auction found for identifier:', idOrSlug);
        return null;
      }

      console.log('✅ Found auction with ID:', auction.id, 'for identifier:', idOrSlug);

      // Fetch bid history - data consistency is now guaranteed by database triggers
      const { data: bidHistory = [] } = await supabase
        .from('bid_history')
        .select('bidder, amount, time')
        .eq('auction_id', auction.id)
        .order('time', { ascending: false })
        .order('amount', { ascending: false });

      console.log('📊 Auction data is consistent via database triggers');

      return {
        ...auction,
        endTime: new Date(auction.end_time),
        bidHistory: bidHistory ?? []
      };
    },
    retry: (failureCount, error: any) => {
      // Don't retry on not found errors
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
    staleTime: 1000,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  // Set up real-time subscriptions using the resolved auction ID
  useEffect(() => {
    if (!query.data?.id) return;

    const auctionId = query.data.id;
    console.log('🔔 Setting up real-time subscriptions for auction ID:', auctionId);

    const channel = supabase
      .channel(`auction-updates-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${auctionId}`
        },
        (payload) => {
          console.log('📡 Auction updated via real-time:', payload);
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bid_history',
          filter: `auction_id=eq.${auctionId}`
        },
        (payload) => {
          console.log('📡 Bid history updated via real-time:', payload);
          query.refetch();
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up real-time subscriptions for auction:', auctionId);
      supabase.removeChannel(channel);
    };
  }, [query.data?.id, query.refetch]);

  return query;
};
