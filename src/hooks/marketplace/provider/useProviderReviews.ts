import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateReviewTrend } from '@/lib/provider-utils';

export const useProviderReviews = (providerId: string) => {
  return useQuery({
    queryKey: ['provider-reviews', providerId],
    queryFn: async () => {
      // Fetch all reviews for this provider's services
      const { data: reviews, error } = await supabase
        .from('service_reviews')
        .select('*, services!inner(provider_id, title)')
        .eq('services.provider_id', providerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!reviews || reviews.length === 0) {
        return {
          avgRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recentReviews: [],
          trend: { trend: 'stable' as const, change: 0 },
        };
      }
      
      // Calculate average rating
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      // Rating distribution
      const ratingDistribution = reviews.reduce((acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      // Ensure all ratings have a value
      for (let i = 1; i <= 5; i++) {
        if (!ratingDistribution[i]) ratingDistribution[i] = 0;
      }
      
      // Recent reviews (top 3)
      const recentReviews = reviews.slice(0, 3).map(r => ({
        id: r.id,
        customerName: r.customer_name,
        rating: r.rating,
        comment: r.comment,
        serviceName: (r as any).services?.title || 'Unknown Service',
        createdAt: r.created_at,
      }));
      
      // Calculate trend (last 10 vs previous reviews)
      const recentAvg = reviews.slice(0, 10).reduce((sum, r) => sum + r.rating, 0) / Math.min(reviews.length, 10);
      const olderAvg = reviews.length > 10
        ? reviews.slice(10).reduce((sum, r) => sum + r.rating, 0) / (reviews.length - 10)
        : recentAvg;
      
      const trend = calculateReviewTrend(recentAvg, olderAvg);
      
      return {
        avgRating,
        totalReviews: reviews.length,
        ratingDistribution,
        recentReviews,
        trend,
      };
    },
    enabled: !!providerId,
    staleTime: 300000, // 5 minutes
  });
};
