import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import type { FundingCampaign } from '@/types/funding';

interface EventCampaignsTabProps {
  eventId: string;
  campaigns: FundingCampaign[];
  isLoading: boolean;
}

export const EventCampaignsTab = ({ eventId, campaigns, isLoading }: EventCampaignsTabProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-muted" />;
  }

  if (campaigns.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create a funding campaign to raise money for this event
        </p>
        <Button onClick={() => navigate('/admin/campaigns/new')}>
          Create Campaign
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {campaigns.length} {campaigns.length === 1 ? 'Campaign' : 'Campaigns'}
        </h3>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => navigate('/admin/campaigns/new')}
        >
          Create New Campaign
        </Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => {
          const percentFunded = campaign.target_amount > 0
            ? (campaign.raised_amount / campaign.target_amount) * 100
            : 0;

          return (
            <Card key={campaign.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold">{campaign.title}</h4>
                    <Badge variant={
                      campaign.status === 'active' ? 'default' :
                      campaign.status === 'successful' ? 'outline' :
                      'secondary'
                    }>
                      {campaign.status}
                    </Badge>
                  </div>
                  
                  {campaign.short_description && (
                    <p className="text-sm text-muted-foreground">
                      {campaign.short_description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">
                        {campaign.raised_amount.toLocaleString()} {campaign.currency}
                      </span>
                      <span className="text-muted-foreground">
                        / {campaign.target_amount.toLocaleString()} {campaign.currency}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {percentFunded.toFixed(0)}% funded
                    </Badge>
                  </div>

                  {campaign.deadline && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Ends: {new Date(campaign.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                  >
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`/campaigns/${campaign.slug}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Public
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
