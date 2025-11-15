import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    title: string;
    short_description?: string;
    target_amount: number;
    raised_amount: number;
    currency: string;
    status: string;
    deadline?: string;
    projects?: { title: string; slug: string } | null;
    collaboration_projects?: { title: string; slug: string } | null;
  };
  evaluationSummary?: {
    weighted_eckt: number;
    count: number;
  };
}

export const CampaignCard = ({ campaign, evaluationSummary }: CampaignCardProps) => {
  const percentFunded = campaign.target_amount > 0
    ? Math.round((campaign.raised_amount / campaign.target_amount) * 100)
    : 0;

  const daysLeft = campaign.deadline
    ? formatDistanceToNow(new Date(campaign.deadline), { addSuffix: true })
    : null;

  const linkedProject = campaign.projects || campaign.collaboration_projects;

  return (
    <Link to={`/campaigns/${campaign.slug}`}>
      <Card className="group h-full backdrop-blur-xl bg-card/40 border-2 border-border/50 shadow-xl hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-500 rounded-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
              {campaign.title}
            </CardTitle>
            <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
              {campaign.status}
            </Badge>
          </div>
          {campaign.short_description && (
            <CardDescription className="line-clamp-2">
              {campaign.short_description}
            </CardDescription>
          )}
          {linkedProject && (
            <Badge variant="secondary" className="w-fit mt-2">
              {linkedProject.title}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Funding progress</span>
              <span className="font-semibold">{percentFunded}%</span>
            </div>
            <Progress value={percentFunded} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                {campaign.raised_amount.toLocaleString()} {campaign.currency}
              </span>
              <span className="text-muted-foreground">
                of {campaign.target_amount.toLocaleString()} {campaign.currency}
              </span>
            </div>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            {evaluationSummary && evaluationSummary.count > 0 && (
              <Badge variant="outline" className="gap-1">
                <BarChart3 className="h-3 w-3" />
                Conviction: {evaluationSummary.weighted_eckt.toFixed(0)}/100
              </Badge>
            )}
            {daysLeft && campaign.status === 'active' && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {daysLeft}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
            <TrendingUp className="h-4 w-4" />
            View campaign
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
