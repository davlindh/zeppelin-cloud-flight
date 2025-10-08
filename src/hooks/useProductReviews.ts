
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductReview {
  id: string;
  reviewer_name: string;
  reviewer_email?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  verified_purchase?: boolean | null;
  helpful_votes?: number | null;
  created_at: string;
}

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async (): Promise<ProductReview[]> => {
      console.log('Fetching reviews for product:', productId);
      
      try {
        const { data: reviewsData, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching product reviews:', error);
          throw error;
        }

        console.log('Fetched product reviews:', reviewsData);
        return reviewsData ?? [];
      } catch (error) {
        console.error('Failed to fetch product reviews:', error);
        return [];
      }
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useProductReviewStats = (productId: string) => {
  return useQuery({
    queryKey: ['product-review-stats', productId],
    queryFn: async () => {
      console.log('Fetching review stats for product:', productId);
      
      try {
        const { data: reviewsData, error } = await supabase
          .from('product_reviews')
          .select('rating')
          .eq('product_id', productId);

        if (error) {
          console.error('Error fetching product review stats:', error);
          throw error;
        }

        if (!reviewsData || reviewsData.length === 0) {
          return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          };
        }

        const totalReviews = reviewsData.length;
        const averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
        
        const ratingDistribution = reviewsData.reduce((dist, review) => {
          dist[review.rating as keyof typeof dist] = (dist[review.rating as keyof typeof dist] || 0) + 1;
          return dist;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>);

        return {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution
        };
      } catch (error) {
        console.error('Failed to fetch product review stats:', error);
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
