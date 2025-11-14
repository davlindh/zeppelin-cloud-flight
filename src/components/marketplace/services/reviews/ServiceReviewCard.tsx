import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, BadgeCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { ServiceReview } from '@/hooks/marketplace/useServiceReviews';
import { useToggleHelpfulVote, useHasVotedHelpful } from '@/hooks/marketplace/useServiceReviews';
import { cn } from '@/lib/utils';

interface ServiceReviewCardProps {
  review: ServiceReview;
  sessionId?: string;
}

export const ServiceReviewCard: React.FC<ServiceReviewCardProps> = ({ review, sessionId }) => {
  const [showAllImages, setShowAllImages] = useState(false);
  const toggleHelpful = useToggleHelpfulVote();
  const { data: hasVoted } = useHasVotedHelpful(review.id, sessionId);

  const displayImages = showAllImages ? review.images : review.images.slice(0, 3);
  const remainingImages = review.images.length - 3;

  const handleHelpfulClick = () => {
    toggleHelpful.mutate({ reviewId: review.id, sessionId });
  };

  // Calculate rating percentage color
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'text-green-600 bg-green-50';
    if (rating >= 70) return 'text-blue-600 bg-blue-50';
    if (rating >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{review.customer_name}</span>
              {review.verified_booking && (
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  Verifierad bokning
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), {
                addSuffix: true,
                locale: sv,
              })}
            </p>
          </div>

          {/* Rating Badge */}
          <Badge className={cn('text-lg font-bold px-3 py-1', getRatingColor(review.rating))}>
            {review.rating}%
          </Badge>
        </div>

        {/* Comment */}
        <p className="text-sm leading-relaxed">{review.comment}</p>

        {/* Images */}
        {review.images.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {displayImages.map((image, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={`Review image ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
            {remainingImages > 0 && !showAllImages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllImages(true)}
                className="text-xs"
              >
                Visa {remainingImages} till bilder
              </Button>
            )}
          </div>
        )}

        {/* Helpful Vote */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant={hasVoted ? 'default' : 'outline'}
            size="sm"
            onClick={handleHelpfulClick}
            disabled={toggleHelpful.isPending}
            className="gap-2"
          >
            <ThumbsUp className={cn('h-4 w-4', hasVoted && 'fill-current')} />
            Hjälpsam ({review.helpful_votes})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
