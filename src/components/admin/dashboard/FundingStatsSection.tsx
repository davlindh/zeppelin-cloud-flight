import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Target, Award } from 'lucide-react';
import { StatCard } from './StatCard';
import type { UnifiedDashboardStats } from '@/hooks/useUnifiedDashboardStats';

interface FundingStatsSectionProps {
  stats: UnifiedDashboardStats['funding'];
}

export const FundingStatsSection = ({ stats }: FundingStatsSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Funding & Campaigns</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Raised (30d)"
          value={`${stats.total_raised_30d.toLocaleString()} SEK`}
          subtitle={`${stats.total_raised_all_time.toLocaleString()} total`}
          icon={DollarSign}
          onClick={() => navigate('/admin/campaigns')}
        />
        
        <StatCard
          title="Active Campaigns"
          value={stats.active_campaigns}
          subtitle={`${stats.campaigns_successful} successful`}
          icon={Target}
          onClick={() => navigate('/admin/campaigns?status=active')}
        />
        
        <StatCard
          title="Avg Success Rate"
          value={`${stats.avg_campaign_success_rate}%`}
          icon={TrendingUp}
          onClick={() => navigate('/admin/campaigns')}
        />
        
        <StatCard
          title="Total Raised"
          value={`${stats.total_raised_all_time.toLocaleString()} SEK`}
          icon={Award}
          onClick={() => navigate('/admin/campaigns')}
        />
      </div>
    </div>
  );
};
