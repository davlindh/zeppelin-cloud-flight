import React from 'react';
import { useUserDonations } from '@/hooks/funding/useUserDonations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Sparkles, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface ProfileDonationHistoryProps {
  userId: string;
}

export const ProfileDonationHistory: React.FC<ProfileDonationHistoryProps> = ({ userId }) => {
  const { data: donations, isLoading } = useUserDonations(userId);

  const succeededDonations = donations?.filter(d => d.status === 'succeeded') || [];
  const pendingDonations = donations?.filter(d => d.status === 'pending') || [];
  const otherDonations = donations?.filter(d => !['succeeded', 'pending'].includes(d.status)) || [];

  const totalDonated = succeededDonations.reduce((sum, d) => sum + d.amount, 0);
  const totalFaveEarned = succeededDonations.reduce((sum, d) => sum + (d.fave_points_earned || 0), 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Donations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Support campaigns to make a difference and earn Fave points!
          </p>
          <Link to="/campaigns" className="text-primary hover:underline">
            Browse Campaigns →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Donated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalDonated.toLocaleString()} SEK</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Campaigns Supported</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{new Set(succeededDonations.map(d => d.campaign_id)).size}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Fave Points Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalFaveEarned.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Donation List */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="succeeded">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="succeeded">
                Completed ({succeededDonations.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingDonations.length})
              </TabsTrigger>
              <TabsTrigger value="other">
                Other ({otherDonations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="succeeded" className="space-y-4 mt-4">
              {succeededDonations.map(donation => (
                <DonationRow key={donation.id} donation={donation} />
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingDonations.map(donation => (
                <DonationRow key={donation.id} donation={donation} />
              ))}
            </TabsContent>

            <TabsContent value="other" className="space-y-4 mt-4">
              {otherDonations.map(donation => (
                <DonationRow key={donation.id} donation={donation} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const DonationRow = ({ donation }: { donation: any }) => (
  <Link
    to={`/campaigns/${donation.funding_campaigns?.slug}`}
    className="block p-4 border rounded-lg hover:bg-accent transition-colors"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">
          {donation.funding_campaigns?.title || 'Campaign'}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(donation.created_at), 'MMM d, yyyy')}
        </div>
        {donation.message && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            "{donation.message}"
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-lg font-bold">
          {donation.amount.toLocaleString()} {donation.currency}
        </p>
        <Badge variant={donation.status === 'succeeded' ? 'default' : 'secondary'} className="mt-1">
          {donation.status}
        </Badge>
        {donation.fave_points_earned > 0 && (
          <Badge variant="outline" className="gap-1 mt-1">
            <Sparkles className="h-3 w-3" />
            +{donation.fave_points_earned}
          </Badge>
        )}
      </div>
    </div>
  </Link>
);
