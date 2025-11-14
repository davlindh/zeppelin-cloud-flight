import { useNavigate } from 'react-router-dom';
import { Users, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { UnifiedDashboardStats } from '@/hooks/useUnifiedDashboardStats';

interface ServicesStatsSectionProps {
  stats: UnifiedDashboardStats['services'];
}

export const ServicesStatsSection = ({ stats }: ServicesStatsSectionProps) => {
  const navigate = useNavigate();

  const linkageRate = stats.services.total > 0 
    ? Math.round((stats.services.linked / stats.services.total) * 100)
    : 100;

  const hasDataQualityIssues = stats.services.unlinked > 0 || 
                                 stats.providers.without_services > 0 ||
                                 stats.metrics.providers_needing_attention > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tjänster & Leverantörer</h2>
        {hasDataQualityIssues && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/data-cleanup')}
            className="text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Åtgärda datakvalitet
          </Button>
        )}
      </div>

      {/* Data Quality Alert */}
      {hasDataQualityIssues && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Datakvalitetsproblem upptäckta</AlertTitle>
          <AlertDescription className="text-amber-700">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {stats.services.unlinked > 0 && (
                <li>{stats.services.unlinked} tjänster saknar leverantörslänkning</li>
              )}
              {stats.providers.without_services > 0 && (
                <li>{stats.providers.without_services} leverantörer har inga tjänster</li>
              )}
              {stats.metrics.providers_needing_attention > 0 && (
                <li>{stats.metrics.providers_needing_attention} leverantörer behöver granskning (låg rating eller ingen feedback)</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tjänsteleverantörer"
          value={stats.providers.total}
          subtitle={`${stats.providers.with_services} aktiva`}
          icon={Users}
          badge={
            stats.providers.without_services > 0
              ? { label: `${stats.providers.without_services} utan tjänster`, variant: 'destructive' }
              : undefined
          }
          onClick={() => navigate('/admin/providers')}
        />

        <StatCard
          title="Tjänster"
          value={stats.services.total}
          subtitle={`${stats.services.active} aktiva`}
          icon={Wrench}
          badge={
            stats.services.unlinked > 0
              ? { label: `${stats.services.unlinked} olänkade`, variant: 'destructive' }
              : undefined
          }
          onClick={() => navigate('/admin/services')}
        />

        <StatCard
          title="Datakvalitet"
          value={`${linkageRate}%`}
          subtitle="länkningsgrad"
          icon={linkageRate >= 95 ? TrendingUp : AlertTriangle}
          trend={
            linkageRate >= 95 
              ? { value: linkageRate, isPositive: true }
              : undefined
          }
          onClick={() => navigate('/admin/services')}
          className={linkageRate < 95 ? 'border-amber-300' : ''}
        />

        <StatCard
          title="Snitt per leverantör"
          value={stats.metrics.avg_services_per_provider.toFixed(1)}
          subtitle="tjänster"
          icon={TrendingUp}
          onClick={() => navigate('/admin/providers')}
        />
      </div>
    </div>
  );
};
