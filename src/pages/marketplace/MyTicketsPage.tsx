import { Link } from 'react-router-dom';
import { useMyTicketOrders } from '@/hooks/events/useEventTicketOrders';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket, Calendar, MapPin, ArrowLeft, QrCode } from 'lucide-react';
import { format } from 'date-fns';

export const MyTicketsPage = () => {
  const { data: orders = [], isLoading } = useMyTicketOrders();

  // Group tickets by event
  const ticketsByEvent = orders.reduce((acc, order) => {
    const eventId = order.event_id;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: order.event,
        tickets: [],
      };
    }
    acc[eventId].tickets.push(order);
    return acc;
  }, {} as Record<string, { event: any; tickets: typeof orders }>);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/marketplace" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            View and manage your event tickets
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && orders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No Tickets Yet</h2>
              <p className="text-muted-foreground mb-4">
                You haven't purchased any event tickets yet.
              </p>
              <Button asChild>
                <Link to="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tickets by Event */}
        {!isLoading && Object.entries(ticketsByEvent).map(([eventId, { event, tickets }]) => (
          <Card key={eventId} className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {event?.title || 'Event'}
                  </CardTitle>
                  {event && (
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {event.starts_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(event.starts_at), 'PPP')}</span>
                        </div>
                      )}
                      {event.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.venue}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {event?.slug && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/events/${event.slug}`}>View Event</Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Ticket className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {ticket.ticket_type?.name || 'Ticket'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {ticket.quantity} × {ticket.unit_price.toFixed(2)} {ticket.currency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Purchased: {format(new Date(ticket.created_at), 'PP')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          ticket.status === 'confirmed'
                            ? 'default'
                            : ticket.status === 'pending'
                            ? 'secondary'
                            : ticket.status === 'cancelled'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {ticket.status}
                      </Badge>
                      <Button variant="outline" size="sm" disabled>
                        <QrCode className="h-4 w-4 mr-1" />
                        QR Code
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
      <Footer />
    </div>
  );
};
