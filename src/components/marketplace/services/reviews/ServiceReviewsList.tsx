import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Filter } from 'lucide-react';
import { ServiceReviewCard } from './ServiceReviewCard';
import { useServiceReviews, type ReviewSortBy, type ReviewFilter } from '@/hooks/marketplace/useServiceReviews';

interface ServiceReviewsListProps {
  serviceId: string;
  sessionId?: string;
}

export const ServiceReviewsList: React.FC<ServiceReviewsListProps> = ({ serviceId, sessionId }) => {
  const [sortBy, setSortBy] = useState<ReviewSortBy>('newest');
  const [filter, setFilter] = useState<ReviewFilter>('all');

  const { data: reviews, isLoading } = useServiceReviews(serviceId, sortBy, filter);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Laddar recensioner...</p>
        </CardContent>
      </Card>
    );
  }

  const reviewCount = reviews?.length || 0;
  const verifiedCount = reviews?.filter(r => r.verified_booking).length || 0;
  const withImagesCount = reviews?.filter(r => r.images.length > 0).length || 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>Recensioner ({reviewCount})</CardTitle>
            
            {/* Filters & Sorting */}
            <div className="flex items-center gap-2">
              {/* Filter */}
              <Select value={filter} onValueChange={(value) => setFilter(value as ReviewFilter)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Alla recensioner ({reviewCount})
                  </SelectItem>
                  <SelectItem value="verified">
                    Verifierade ({verifiedCount})
                  </SelectItem>
                  <SelectItem value="with_images">
                    Med bilder ({withImagesCount})
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as ReviewSortBy)}>
                <SelectTrigger className="w-[160px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Nyaste</SelectItem>
                  <SelectItem value="oldest">Äldsta</SelectItem>
                  <SelectItem value="highest">Högst betyg</SelectItem>
                  <SelectItem value="lowest">Lägst betyg</SelectItem>
                  <SelectItem value="helpful">Mest hjälpsam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Reviews */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ServiceReviewCard key={review.id} review={review} sessionId={sessionId} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Inga recensioner matchar dina filter</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter('all');
                setSortBy('newest');
              }}
              className="mt-4"
            >
              Återställ filter
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
