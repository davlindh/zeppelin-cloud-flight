import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useProviderReviews } from '@/hooks/marketplace/provider/useProviderReviews';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface ReviewsSnapshotProps {
  providerId: string;
}

export const ReviewsSnapshot: React.FC<ReviewsSnapshotProps> = ({ providerId }) => {
  const { data: reviews, isLoading } = useProviderReviews(providerId);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!reviews) return null;
  
  const TrendIcon = reviews.trend.trend === 'up' ? TrendingUp : 
                    reviews.trend.trend === 'down' ? TrendingDown : Minus;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Reviews Snapshot
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/marketplace/reviews">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold">{reviews.avgRating.toFixed(1)}</p>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i <= Math.round(reviews.avgRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {reviews.totalReviews} reviews
            </p>
          </div>
          
          {/* Rating Distribution */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.ratingDistribution[rating] || 0;
              const percentage = reviews.totalReviews > 0 
                ? (count / reviews.totalReviews) * 100 
                : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs w-3">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
          <TrendIcon className={`h-5 w-5 ${
            reviews.trend.trend === 'up' ? 'text-green-600 dark:text-green-400' :
            reviews.trend.trend === 'down' ? 'text-red-600 dark:text-red-400' :
            'text-muted-foreground'
          }`} />
          <span className="text-sm font-medium">
            {reviews.trend.trend === 'up' ? 'Improving' :
             reviews.trend.trend === 'down' ? 'Declining' :
             'Stable'}
          </span>
          {reviews.trend.change > 0 && (
            <span className="text-xs text-muted-foreground">
              ({reviews.trend.change.toFixed(1)} points)
            </span>
          )}
        </div>
        
        {/* Recent Reviews */}
        {reviews.recentReviews.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recent Reviews</h4>
            <div className="space-y-3">
              {reviews.recentReviews.map((review) => (
                <div key={review.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{review.customerName}</p>
                      <p className="text-xs text-muted-foreground">{review.serviceName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
