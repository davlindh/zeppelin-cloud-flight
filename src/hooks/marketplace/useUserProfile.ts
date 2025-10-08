import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  username: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  email_verified: boolean;
  preferences: any;
  role: string;
  customer_id: number | null;
  address: string | null;
  company_name: string | null;
  vat_number: string | null;
  customer_type: string;
  preferred_contact_method: string;
  preferred_payment_method: string | null;
  loyalty_points: number;
  last_purchase_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  auctionsWon: number;
  averageRating: number;
  productsPurchased: number;
  bidsPlaced: number;
  itemsSold: number;
  daysActive: number;
  totalOrders: number;
  totalBids: number;
  watchlistItems: number;
  favoriteItems: number;
  totalSpent: number;
  memberSince: string;
}

export const useUserProfile = () => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer data fetching with setTimeout to avoid auth deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setStats(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile with safe UUID handling
      if (!userId || userId === '') {
        throw new Error('Invalid user ID');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        console.warn('No profile found for user, this should not happen with the new trigger');
        setProfile(null);
        setStats(null);
        return;
      }

      setProfile(profileData as UserProfile);

      // Fetch user statistics using the profile.id (UUID) not auth_user_id
      const profileId = profileData.id;
      
      const [ordersQuery, bidsQuery, watchlistQuery, favoritesQuery] = await Promise.all([
        supabase.from('orders').select('total_amount').eq('user_id', profileId),
        supabase.from('bid_history').select('id').eq('user_id', profileId),
        supabase.from('user_watchlist').select('id').eq('user_id', profileId),
        supabase.from('user_favorites').select('id').eq('user_id', profileId)
      ]);

      const totalSpent = ordersQuery.data?.reduce((sum, order) => sum + (order.total_amount ?? 0), 0) || 0;
      
      setStats({
        auctionsWon: 0, // TODO: implement auction wins query
        averageRating: 4.5, // TODO: implement rating calculation
        productsPurchased: ordersQuery.data?.length ?? 0,
        bidsPlaced: bidsQuery.data?.length ?? 0,
        itemsSold: 0, // TODO: implement items sold query
        daysActive: Math.floor((Date.now() - new Date(profileData?.created_at || 0).getTime()) / (1000 * 60 * 60 * 24)),
        totalOrders: ordersQuery.data?.length ?? 0,
        totalBids: bidsQuery.data?.length ?? 0,
        watchlistItems: watchlistQuery.data?.length ?? 0,
        favoriteItems: favoritesQuery.data?.length ?? 0,
        totalSpent,
        memberSince: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'
      });

    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      setError(null);

      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      return true; // Indicate success
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  return {
    user,
    session,
    profile,
    stats,
    loading,
    error,
    updateProfile,
    signOut,
    isAuthenticated: !!session
  };
};
