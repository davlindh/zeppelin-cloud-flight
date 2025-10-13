import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  auth_user_id: string | null;
  username?: string | null;
  full_name?: string | null;
  email: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  email_verified: boolean | null;
  preferences: any;
  customer_id: number | null;
  address?: string | null;
  company_name?: string | null;
  vat_number?: string | null;
  customer_type: string | null;
  preferred_contact_method: string | null;
  preferred_payment_method?: string | null;
  loyalty_points: number | null;
  last_purchase_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  totalFavorites: number;
  totalWatchlist: number;
  totalBids: number;
  totalSpent: number;
}

// Shared query key factory for consistency and cache management
export const userQueries = {
  all: ['user'] as const,
  profile: (userId?: string) => [...userQueries.all, 'profile', userId] as const,
  stats: (userId?: string) => [...userQueries.all, 'stats', userId] as const,
  favorites: (userId?: string) => [...userQueries.all, 'favorites', userId] as const,
  watchlist: (userId?: string) => [...userQueries.all, 'watchlist', userId] as const,
  bids: (userId?: string) => [...userQueries.all, 'bids', userId] as const,
  orders: (userId?: string) => [...userQueries.all, 'orders', userId] as const,
};

export const useOptimizedUserProfile = () => {
  return useQuery({
    queryKey: userQueries.profile(),
    queryFn: async (): Promise<UserProfile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent duplicate calls
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Prevent excessive refetching
    refetchOnReconnect: false,
    refetchInterval: false, // Disable polling
  });
};

export const useOptimizedUserStats = () => {
  const { data: profile } = useOptimizedUserProfile();
  
  return useQuery({
    queryKey: userQueries.stats(profile?.id),
    queryFn: async (): Promise<UserStats> => {
      if (!profile?.id) {
        return {
          totalFavorites: 0,
          totalWatchlist: 0,
          totalBids: 0,
          totalSpent: 0,
        };
      }

      // Single batch query to reduce duplicate calls
      const [favoritesResult, watchlistResult, bidsResult, ordersResult] = await Promise.all([
        supabase.from('user_favorites').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        supabase.from('user_watchlist').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        supabase.from('bid_history').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        supabase.from('orders').select('total_amount').eq('user_id', profile.id),
      ]);

      const totalSpent = ordersResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      return {
        totalFavorites: favoritesResult.count || 0,
        totalWatchlist: watchlistResult.count || 0,
        totalBids: bidsResult.count || 0,
        totalSpent,
      };
    },
    enabled: !!profile?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(userQueries.profile(), data);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Helper to invalidate all user-related queries
export const useInvalidateUserQueries = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: userQueries.all });
  };
};