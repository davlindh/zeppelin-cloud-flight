import { useEventTicketTypes } from '@/hooks/events/useEventTicketTypes';
import { PublicTicketCard } from './PublicTicketCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket } from 'lucide-react';

interface EventTicketsSectionProps {
  eventId: string;
}

export const EventTicketsSection: React.FC<EventTicketsSectionProps> = ({ eventId }) => {
  const { data: tickets = [], isLoading } = useEventTicketTypes(eventId);

  // Filter for public visible and active tickets
  const publicTickets = tickets.filter(
    (t) => t.is_active && t.is_visible_public
  );

  // Check sales windows
  const now = new Date();
  const availableTickets = publicTickets.filter((t) => {
    const salesStart = t.sales_start ? new Date(t.sales_start) : null;
    const salesEnd = t.sales_end ? new Date(t.sales_end) : null;
    
    if (salesStart && now < salesStart) return false;
    if (salesEnd && now > salesEnd) return false;
    
    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!publicTickets.length) {
    return null;
  }

  if (!availableTickets.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Tickets Available</h3>
          <p className="text-sm text-muted-foreground">
            Ticket sales for this event have not started yet or have ended.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Get Your Tickets</h2>
          <p className="text-sm text-muted-foreground">
            Choose your ticket type and reserve your spot at this event.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {availableTickets.map((ticket) => (
            <PublicTicketCard
              key={ticket.id}
              ticket={ticket}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
