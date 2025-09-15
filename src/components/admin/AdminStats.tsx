import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FolderOpen, Users, Building, Inbox, TrendingUp, type LucideIcon } from 'lucide-react';

interface Stats {
  showcases: number;
  participants: number;
  sponsors: number;
  pendingSubmissions: number;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    showcases: 0,
    participants: 0,
    sponsors: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Set up real-time subscriptions for stats updates
    const channel = supabase
      .channel('admin_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsors' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [
        { count: showcasesCount },
        { count: participantsCount },
        { count: sponsorsCount },
        { count: pendingCount }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('participants').select('*', { count: 'exact', head: true }),
        supabase.from('sponsors').select('*', { count: 'exact', head: true }),
        supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        showcases: showcasesCount || 0,
        participants: participantsCount || 0,
        sponsors: sponsorsCount || 0,
        pendingSubmissions: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    trend
  }: {
    title: string;
    value: number;
    icon: LucideIcon;
    description: string;
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
          ) : (
            value.toLocaleString()
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2 text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Showcase Items"
        value={stats.showcases}
        icon={FolderOpen}
        description="Items in showcase"
        trend={stats.showcases > 0 ? "+12% from last month" : undefined}
      />
      
      <StatCard
        title="Participants"
        value={stats.participants}
        icon={Users}
        description="Active participants"
        trend={stats.participants > 0 ? "+8% from last month" : undefined}
      />
      
      <StatCard
        title="Sponsors"
        value={stats.sponsors}
        icon={Building}
        description="Supporting organizations"
        trend={stats.sponsors > 0 ? "+3% from last month" : undefined}
      />
      
      <StatCard
        title="Pending Submissions"
        value={stats.pendingSubmissions}
        icon={Inbox}
        description="Awaiting review"
      />
    </div>
  );
};
