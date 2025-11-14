import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import type { ServiceReview } from '@/hooks/marketplace/useServiceReviews';

interface ServiceRatingsSummaryProps {
  reviews: ServiceReview[];
}

export const ServiceRatingsSummary: React.FC<ServiceRatingsSummaryProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Inga recensioner ännu</p>
          <p className="text-sm text-muted-foreground mt-2">Var den första att lämna en recension!</p>
        </CardContent>
      </Card>
    );
  }

  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
  const verifiedCount = reviews.filter(r => r.verified_booking).length;

  // Calculate rating distribution
  const distribution = {
    '90-100': reviews.filter(r => r.rating >= 90).length,
    '70-89': reviews.filter(r => r.rating >= 70 && r.rating < 90).length,
    '50-69': reviews.filter(r => r.rating >= 50 && r.rating < 70).length,
    '30-49': reviews.filter(r => r.rating >= 30 && r.rating < 50).length,
    '0-29': reviews.filter(r => r.rating < 30).length,
  };

  const getPercentage = (count: number) => (count / totalReviews) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kundbetyg</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary">{averageRating.toFixed(0)}%</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? 'recension' : 'recensioner'}
              </span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {Object.entries(distribution).map(([range, count]) => (
              <div key={range} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12">{range}%</span>
                <Progress value={getPercentage(count)} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Stats */}
        {verifiedCount > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verifierade bokningar</span>
              <span className="font-semibold">
                {verifiedCount} av {totalReviews}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
