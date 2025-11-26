import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EventTicketsSection } from '@/components/public/events/EventTicketsSection';
import { CalendarDays, MapPin, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event-public', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Event not found</h2>
              <p className="text-muted-foreground mb-4">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/events">View All Events</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const startDate = new Date(event.starts_at);
  const endDate = new Date(event.ends_at);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/events" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </Button>
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {event.is_featured && (
              <Badge variant="default">Featured</Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {event.status}
            </Badge>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{event.title}</h1>
          
          {/* Event Meta */}
          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              <span>
                {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
              </span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.venue}{event.location && `, ${event.location}`}</span>
              </div>
            )}
            {event.capacity > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Capacity: {event.capacity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Description */}
        {event.description && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets Section */}
        <EventTicketsSection eventId={event.id} eventSlug={event.slug} />
      </main>
      <Footer />
    </div>
  );
};
