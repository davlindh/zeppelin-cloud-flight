import { useNavigate } from 'react-router-dom';
import { FileText, Users, FolderKanban, Image, Heart } from 'lucide-react';
import { StatCard } from './StatCard';
import type { UnifiedDashboardStats } from '@/hooks/useUnifiedDashboardStats';

interface ZeppelStatsSectionProps {
  stats: UnifiedDashboardStats['zeppel'];
}

export const ZeppelStatsSection = ({ stats }: ZeppelStatsSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Zeppel Admin</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Inlämningar"
          value={stats.submissions.total}
          subtitle={`${stats.submissions.pending} väntande`}
          icon={FileText}
          badge={
            stats.submissions.pending > 0
              ? { label: `${stats.submissions.pending} väntande`, variant: 'destructive' }
              : undefined
          }
          onClick={() => navigate('/admin/submissions')}
        />
        
        <StatCard
          title="Deltagare"
          value={stats.participants.total}
          subtitle={`${stats.participants.with_profiles} med profil`}
          icon={Users}
          onClick={() => navigate('/admin/participants')}
        />
        
        <StatCard
          title="Projekt"
          value={stats.projects.total}
          icon={FolderKanban}
          onClick={() => navigate('/admin/projects')}
        />
        
        <StatCard
          title="Media"
          value={stats.media.total}
          subtitle={`${stats.media.pending} väntande`}
          icon={Image}
          badge={
            stats.media.pending > 0
              ? { label: `${stats.media.pending} väntande`, variant: 'destructive' }
              : undefined
          }
          onClick={() => navigate('/admin/media')}
        />
        
        <StatCard
          title="Sponsorer"
          value={stats.sponsors.total}
          icon={Heart}
          onClick={() => navigate('/admin/sponsors')}
        />
      </div>
    </div>
  );
};
