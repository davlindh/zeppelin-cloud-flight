import React from 'react';
import { useCampaignsWithEvaluation } from '@/hooks/funding/useCampaignsWithEvaluation';
import { CampaignCard } from '@/components/funding/CampaignCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturedCampaignsSection: React.FC = () => {
  const { data: campaigns } = useCampaignsWithEvaluation({
    status: ['active'],
    visibility: 'public',
  });

  const featured = React.useMemo(() => {
    if (!campaigns) return [];
    // Sort by ECKT (conviction) and take top 3
    return [...campaigns]
      .sort((a, b) => {
        const aEckt = a.evaluation_summary?.weighted_eckt || 0;
        const bEckt = b.evaluation_summary?.weighted_eckt || 0;
        return bEckt - aEckt;
      })
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
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign} 
              evaluationSummary={campaign.evaluation_summary}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
