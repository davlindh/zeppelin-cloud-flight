import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CalendarDays, MapPin, Users, Ticket, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface EventWithTickets {
  id: string;
  title: string;
  slug: string;
  description: string;
  starts_at: string;
  ends_at: string;
  venue: string;
  location: string;
  capacity: number;
  is_featured: boolean;
  ticket_types?: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    is_active: boolean;
    is_visible_public: boolean;
    description?: string;
  }>;
}

export const EventsOverviewPage: React.FC = () => {
  const { data: events, isLoading, error } = useQuery<EventWithTickets[]>({
    queryKey: ['events-public'],
    queryFn: async () => {
      // First get published events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('starts_at', new Date().toISOString()) // Future events only
        .order('starts_at', { ascending: true });

      if (eventsError) throw eventsError;

      // Get ticket types for each event
      const eventsWithTickets = await Promise.all(
        eventsData.map(async (event) => {
          const { data: tickets } = await supabase
            .from('event_ticket_types')
            .select('id, name, price, currency, is_active, is_visible_public, description')
            .eq('event_id', event.id)
            .eq('is_active', true)
            .eq('is_visible_public', true)
            .order('price', { ascending: true });

          return {
            ...event,
            ticket_types: tickets || []
          } as EventWithTickets;
        })
      );

      // Filter to only events with available ticket types
      return eventsWithTickets.filter(event => event.ticket_types.length > 0);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading events...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !events) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Evenemang</h2>
              <p className="text-muted-foreground mb-4">
                Det går inte att läsa in evenemang just nu. Försök igen senare.
              </p>
              <Button asChild>
                <Link to="/">Tillbaka till startsidan</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Evenemang & öppna dagar i Zeppel Inn
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Här ser du vad som händer i residenset – och vilka evenemang du kan köpa biljetter till.
            </p>
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Inga kommande evenemang</h3>
                <p className="text-sm text-muted-foreground">
                  Inga evenemang med tillgängliga biljetter just nu. Kolla tillbaka snart!
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Evenemang & öppna dagar i Zeppel Inn
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Här ser du vad som händer i residenset – och vilka evenemang du kan köpa biljetter till.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {/* Shop Link */}
        <div className="text-center">
          <Card className="inline-block">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Vill du se fler produkter från våra evenemang?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kolla in våra exklusiva event-produkter och merchandise i butiken.
              </p>
              <Button asChild>
                <Link to="/marketplace/shop">
                  Till butiken <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface EventCardProps {
  event: EventWithTickets;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const startDate = new Date(event.starts_at);
  const endDate = new Date(event.ends_at);

  // Get cheapest paid ticket and any free tickets
  const paidTickets = event.ticket_types.filter(t => t.price > 0);
  const freeTickets = event.ticket_types.filter(t => t.price === 0);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
          {event.is_featured && (
            <Badge variant="default">Utvallt</Badge>
          )}
        </div>

        {/* Event Meta */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              {format(startDate, 'd MMM', { locale: undefined })} · {format(startDate, 'HH:mm')}
              {format(startDate, 'yyyy-MM-dd') !== format(endDate, 'yyyy-MM-dd') &&
                ` - ${format(endDate, 'd MMM')}`}
            </span>
          </div>

          {(event.venue || event.location) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.venue || event.location}</span>
            </div>
          )}

          {event.capacity > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Kapacitet: {event.capacity}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Event Description Preview */}
        {event.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Tickets */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Biljetter
          </h4>

          <div className="space-y-1">
            {/* Free tickets first */}
            {freeTickets.length > 0 && (
              <div className="text-sm flex justify-between items-center">
                <span>{freeTickets[0].name}</span>
                <Badge variant="secondary">Gratis</Badge>
              </div>
            )}

            {/* Paid tickets */}
            {paidTickets.length > 0 && (
              <div className="text-sm flex justify-between items-center">
                <span>{paidTickets[0].name}</span>
                <span className="font-medium">
                  {paidTickets[0].price} {paidTickets[0].currency}
                </span>
              </div>
            )}

            {event.ticket_types.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{event.ticket_types.length - 2} fler alternativ
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <Button asChild className="w-full">
          <Link to={`/events/${event.slug}`}>
            Läs mer & köp biljett <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
