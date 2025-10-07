import React from 'react';
import { Star, Verified, Quote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Review {
  id: string; // Changed from number to string
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface ServiceProviderReviewsProps {
  reviews: Review[];
}

export const ServiceProviderReviews: React.FC<ServiceProviderReviewsProps> = ({
  reviews
}) => {
  if (!reviews || reviews.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle>Recent Client Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="border-b border-slate-100 last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-600">
                      {review.clientName.split(' ').map(n => n[0]).join(')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 text-sm">
                        {review.clientName}
                      </span>
                      {review.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-0">
                          <Verified className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDate(review.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative pl-10">
                <Quote className="absolute left-0 top-0 h-4 w-4 text-slate-300" />
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  {review.comment}
                </p>
              </div>
            </div>
          ))}
          
          {reviews.length > 3 && (
            <div className="text-center pt-2">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                View all {reviews.length} reviews
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
