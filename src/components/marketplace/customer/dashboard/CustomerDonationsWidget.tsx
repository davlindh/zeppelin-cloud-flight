import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useUserDonations } from '@/hooks/funding/useUserDonations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const CustomerDonationsWidget: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: donations, isLoading } = useUserDonations(user?.id);

  const recentDonations = donations?.slice(0, 3) || [];
  const totalDonated = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Recent Donations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Support Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Support a campaign to get started
          </p>
          <Button asChild variant="default">
            <Link to="/campaigns">
              Browse Campaigns
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Recent Donations
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/marketplace/profile?tab=donations">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-primary/5 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Donated</div>
          <div className="text-2xl font-bold">{totalDonated.toLocaleString()} SEK</div>
        </div>

        <div className="space-y-3">
          {recentDonations.map((donation) => (
            <Link
              key={donation.id}
              to={`/campaigns/${donation.funding_campaigns?.slug}`}
              className="block"
            >
              <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {donation.funding_campaigns?.title || 'Campaign'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold">
                      {donation.amount.toLocaleString()} {donation.currency}
                    </p>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Sparkles className="h-3 w-3" />
                      +{donation.fave_points_earned || 0}
                    </Badge>
                  </div>
                </div>
                <Badge variant={donation.status === 'succeeded' ? 'default' : 'secondary'} className="mt-2">
                  {donation.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
