import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '@/hooks/funding/useCampaigns';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, TrendingUp } from 'lucide-react';

export const ParticipantCampaignsWidget: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: campaigns } = useCampaigns();

  const myCampaigns = React.useMemo(() => {
    if (!campaigns || !user) return [];
    return campaigns
      .filter(c => c.created_by === user.id && c.status === 'active')
      .slice(0, 3);
  }, [campaigns, user]);

  const totalRaised = myCampaigns.reduce((sum, c) => sum + c.raised_amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            My Campaigns
          </CardTitle>
          <Button size="sm" variant="outline" asChild>
            <Link to="/participant/campaigns/new">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {myCampaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No active campaigns</p>
            <Button asChild>
              <Link to="/participant/campaigns/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Raised</p>
                <p className="text-2xl font-bold">{totalRaised.toLocaleString()} SEK</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-3">
              {myCampaigns.map(campaign => {
                const percentFunded = campaign.target_amount > 0
                  ? Math.round((campaign.raised_amount / campaign.target_amount) * 100)
                  : 0;

                return (
                  <Link
                    key={campaign.id}
                    to={`/campaigns/${campaign.slug}`}
                    className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {campaign.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {percentFunded}%
                      </Badge>
                    </div>
                    <Progress value={percentFunded} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {campaign.raised_amount.toLocaleString()} of{' '}
                      {campaign.target_amount.toLocaleString()} {campaign.currency}
                    </p>
                  </Link>
                );
              })}
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/participant/campaigns">View All Campaigns</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
