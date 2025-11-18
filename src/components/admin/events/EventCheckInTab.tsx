import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEventTicketInstances } from '@/hooks/events/useEventTicketInstances';
import { QrCode, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface EventCheckInTabProps {
  eventId: string;
}

export const EventCheckInTab: React.FC<EventCheckInTabProps> = ({ eventId }) => {
  const { data: instances = [], isLoading } = useEventTicketInstances(eventId);

  const stats = {
    total: instances.length,
    checkedIn: instances.filter(i => i.status === 'checked_in').length,
    valid: instances.filter(i => i.status === 'valid').length,
    void: instances.filter(i => i.status === 'void').length,
  };

  if (isLoading) {
    return <div className="p-6">Loading check-in data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Check-In Interface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use the mobile-optimized check-in page to scan tickets at the door
          </p>
          <Button asChild className="gap-2">
            <Link to={`/admin/events/${eventId}/checkin`}>
              <QrCode className="h-4 w-4" />
              Open Check-In Page
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tickets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-sm text-muted-foreground">Checked In</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.valid}</div>
            <div className="text-sm text-muted-foreground">Valid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.void}</div>
            <div className="text-sm text-muted-foreground">Void</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {instances.filter(i => i.status === 'checked_in').length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No check-ins yet
            </p>
          ) : (
            <div className="space-y-3">
              {instances
                .filter(i => i.status === 'checked_in')
                .slice(0, 20)
                .map((instance) => (
                  <div
                    key={instance.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{instance.ticket_type?.name}</p>
                      {instance.holder_name && (
                        <p className="text-sm text-muted-foreground">
                          {instance.holder_name}
                        </p>
                      )}
                      {instance.holder_email && (
                        <p className="text-xs text-muted-foreground">
                          {instance.holder_email}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Checked In</Badge>
                      {instance.checked_in_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(instance.checked_in_at), 'PPp')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
