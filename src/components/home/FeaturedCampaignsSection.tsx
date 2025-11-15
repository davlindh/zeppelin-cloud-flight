import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '@/hooks/funding/useCampaigns';
import { CampaignCard } from '@/components/funding/CampaignCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target } from 'lucide-react';

export const FeaturedCampaignsSection: React.FC = () => {
  const { data: campaigns } = useCampaigns({
    status: ['active'],
    visibility: 'public',
  });

  const featured = React.useMemo(() => {
    if (!campaigns) return [];
    return campaigns
      .filter(c => c.status === 'active')
      .slice(0, 3);
  }, [campaigns]);

  if (featured.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="container space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              Featured Campaigns
            </h2>
            <p className="text-muted-foreground text-lg">
              Support projects that inspire change
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/campaigns">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  );
};
