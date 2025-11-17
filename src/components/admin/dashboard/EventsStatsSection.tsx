import { useNavigate } from 'react-router-dom';
import { Ticket, DollarSign, Calendar, UserCheck } from 'lucide-react';
import { StatCard } from './StatCard';
import type { UnifiedDashboardStats } from '@/hooks/useUnifiedDashboardStats';

interface EventsStatsSectionProps {
  stats: UnifiedDashboardStats['events'];
}

export const EventsStatsSection = ({ stats }: EventsStatsSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Events & Ticketing</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tickets Sold (30d)"
          value={stats.tickets_sold_30d}
          subtitle={`${stats.ticket_revenue_30d.toLocaleString()} SEK revenue`}
          icon={Ticket}
          onClick={() => navigate('/admin/events/tickets')}
        />
        
        <StatCard
          title="Upcoming Events"
          value={stats.upcoming_events_with_tickets}
          subtitle="with tickets"
          icon={Calendar}
          onClick={() => navigate('/admin/events')}
        />
        
        <StatCard
          title="Registrations"
          value={stats.total_registrations}
          subtitle={`${stats.confirmed_registrations} confirmed`}
          icon={UserCheck}
          onClick={() => navigate('/admin/events/registrations')}
        />
        
        <StatCard
          title="Revenue (30d)"
          value={`${stats.ticket_revenue_30d.toLocaleString()} SEK`}
          icon={DollarSign}
          onClick={() => navigate('/admin/events/tickets')}
        />
      </div>
    </div>
  );
};
