import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceReview {
  id: string;
  service_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  images: string[];
  verified_booking: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
}

export type ReviewSortBy = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
export type ReviewFilter = 'all' | 'verified' | 'with_images';

export const useServiceReviews = (serviceId: string, sortBy: ReviewSortBy = 'newest', filter: ReviewFilter = 'all') => {
  return useQuery({
    queryKey: ['service-reviews', serviceId, sortBy, filter],
    queryFn: async () => {
      const supabaseAny = supabase as any;
      let query = supabaseAny
        .from('service_reviews')
        .select('*')
        .eq('service_id', serviceId);

      // Apply filters
      if (filter === 'verified') {
        query = query.eq('verified_booking', true);
      } else if (filter === 'with_images') {
        query = query.not('images', 'eq', '{}');
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful_votes', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ServiceReview[];
    },
    enabled: !!serviceId,
  });
};

export const useCreateServiceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: Omit<ServiceReview, 'id' | 'helpful_votes' | 'created_at' | 'updated_at' | 'verified_booking'>) => {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from('service_reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceReview;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-reviews', variables.service_id] });
      
      // Track conversion (assuming we can get provider_id from somewhere)
      // This would need to be passed in or fetched
      
      toast.success('Tack för din recension!', {
        description: 'Din recension har publicerats',
      });
    },
    onError: (error: any) => {
      toast.error('Kunde inte skicka recension', {
        description: error.message,
      });
    },
  });
};

export const useToggleHelpfulVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, sessionId }: { reviewId: string; sessionId?: string }) => {
      const supabaseAny = supabase as any;
      const userId = (await supabase.auth.getUser()).data.user?.id;

      // Check if already voted
      const { data: existingVote } = await supabaseAny
        .from('review_helpful_votes')
        .select('id')
        .eq('review_id', reviewId)
        .or(userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`)
        .maybeSingle();

      if (existingVote) {
        // Remove vote
        const { error } = await supabaseAny
          .from('review_helpful_votes')
          .delete()
          .eq('id', existingVote.id);

        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add vote
        const { error } = await supabaseAny
          .from('review_helpful_votes')
          .insert({
            review_id: reviewId,
            user_id: userId || null,
            session_id: sessionId || null,
          });

        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-reviews'] });
    },
  });
};

export const useHasVotedHelpful = (reviewId: string, sessionId?: string) => {
  return useQuery({
    queryKey: ['helpful-vote', reviewId, sessionId],
    queryFn: async () => {
      const supabaseAny = supabase as any;
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { data } = await supabaseAny
        .from('review_helpful_votes')
        .select('id')
        .eq('review_id', reviewId)
        .or(userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`)
        .maybeSingle();

      return !!data;
    },
    enabled: !!reviewId,
  });
};
