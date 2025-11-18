import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface ProfileEventCardProps {
  event: {
    id: string;
    event_id: string;
    title: string;
    slug: string;
    starts_at: string;
    ends_at: string;
    venue?: string;
    location?: string;
    role: 'attendee' | 'organizer';
    ticket_count: number;
    ticket_status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  };
}

const statusConfig = {
  pending: { label: 'Väntar', variant: 'secondary' as const },
  confirmed: { label: 'Bekräftad', variant: 'default' as const },
  cancelled: { label: 'Avbruten', variant: 'destructive' as const },
  refunded: { label: 'Återbetald', variant: 'outline' as const },
};

const roleConfig = {
  attendee: { label: 'Deltagare', variant: 'secondary' as const },
  organizer: { label: 'Arrangör', variant: 'default' as const },
};

export const ProfileEventCard: React.FC<ProfileEventCardProps> = ({ event }) => {
  const eventDate = new Date(event.starts_at);
  const isPast = eventDate < new Date();
  
  return (
    <Link to={`/events/${event.slug}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                  {event.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant={statusConfig[event.ticket_status].variant}>
                    {statusConfig[event.ticket_status].label}
                  </Badge>
                  <Badge variant={roleConfig[event.role].variant}>
                    {roleConfig[event.role].label}
                  </Badge>
                  {isPast && (
                    <Badge variant="outline">Tidigare</Badge>
                  )}
                </div>
              </div>
              
              {/* Ticket count */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Ticket className="h-4 w-4" />
                <span className="text-sm font-medium">{event.ticket_count}</span>
              </div>
            </div>
            
            {/* Event details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  {format(eventDate, 'EEEE d MMMM yyyy, HH:mm', { locale: sv })}
                </span>
              </div>
              
              {(event.venue || event.location) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {event.venue && event.location 
                      ? `${event.venue}, ${event.location}`
                      : event.venue || event.location
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
