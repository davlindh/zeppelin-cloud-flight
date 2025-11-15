import { Card, CardContent } from '@/components/ui/card';
import { Target, BarChart3, Users, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  progress?: number;
}

const MetricCard = ({ icon, label, value, hint, progress }: MetricCardProps) => (
  <Card className="backdrop-blur-xl bg-card/40 border-2 border-border/50 shadow-xl hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden">
    <CardContent className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
        {progress !== undefined && (
          <div className="text-2xl font-bold text-primary">
            {progress}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {value}
        </p>
        {hint && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

interface CampaignStatsProps {
  campaign: {
    raised_amount: number;
    target_amount: number;
    currency: string;
  };
  evaluationSummary?: {
    weighted_eckt: number;
    count: number;
  };
  teamFaveScore?: {
    total: number;
    average: number;
    memberCount: number;
  };
  daysLeft?: string;
}

export const CampaignStats = ({
  campaign,
  evaluationSummary,
  teamFaveScore,
  daysLeft,
}: CampaignStatsProps) => {
  const percentFunded = campaign.target_amount > 0
    ? Math.round((campaign.raised_amount / campaign.target_amount) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        icon={<Target className="h-5 w-5 text-primary" />}
        label="Funding Progress"
        value={`${campaign.raised_amount.toLocaleString()} / ${campaign.target_amount.toLocaleString()} ${campaign.currency}`}
        hint={daysLeft || undefined}
        progress={percentFunded}
      />

      {evaluationSummary && (
        <MetricCard
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          label="Community Conviction"
          value={`${evaluationSummary.weighted_eckt.toFixed(0)}/100`}
          hint={`${evaluationSummary.count} evaluations`}
        />
      )}

      {teamFaveScore && (
        <MetricCard
          icon={<Users className="h-5 w-5 text-primary" />}
          label="Team Reputation"
          value={`${teamFaveScore.total} Fave`}
          hint={teamFaveScore.memberCount > 1 ? `${teamFaveScore.memberCount} members` : 'Solo creator'}
        />
      )}
    </div>
  );
};
