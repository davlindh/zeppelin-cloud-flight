import * as React from "react";
import { useMyRegistrations } from "@/hooks/useMyRegistrations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/shared/useRealtimeSubscription";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { CalendarDays, MapPin, CheckCircle2, Clock, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Event } from "@/types/events";

export const MyEventsSection: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: registrations = [], refetch: refetchRegistrations } = useMyRegistrations();
  const { cancel } = useEventRegistration();

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ["my-events"],
    queryFn: async (): Promise<Event[]> => {
      const eventIds = registrations.map((r) => r.event_id);
      if (eventIds.length === 0) return [];

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds)
        .order("starts_at", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    enabled: registrations.length > 0,
  });

  useRealtimeSubscription({
    table: "event_registrations",
    event: "*",
    filter: `user_id=eq.${user?.id}`,
    onChange: () => {
      refetchRegistrations();
      refetchEvents();
    },
  });

  const eventsWithStatus = React.useMemo(() => {
    return events.map((event) => {
      const registration = registrations.find((r) => r.event_id === event.id);
      return { ...event, registration };
    });
  }, [events, registrations]);

  const now = new Date();
  const upcomingEvents = eventsWithStatus.filter(
    (e) => new Date(e.starts_at) > now
  );
  const pastEvents = eventsWithStatus.filter(
    (e) => new Date(e.starts_at) <= now
  );

  const getStatusBadge = (status: string, checkedIn: boolean) => {
    if (checkedIn) {
      return (
        <Badge variant="default" className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Attended
        </Badge>
      );
    }

    const variants: Record<string, { variant: any; icon: any }> = {
      confirmed: { variant: "default", icon: CheckCircle2 },
      pending: { variant: "secondary", icon: Clock },
      waitlist: { variant: "outline", icon: Users },
      cancelled: { variant: "destructive", icon: X },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="inline-flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const EventCard = ({ event }: { event: typeof eventsWithStatus[0] }) => (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{event.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {event.venue || "Gröna Huset / Zeppel"}
              </p>
            </div>
            {event.registration && (
              <div>
                {getStatusBadge(
                  event.registration.status,
                  !!event.registration.checked_in_at
                )}
              </div>
            )}
          </div>

          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {new Date(event.starts_at).toLocaleDateString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(event.starts_at).toLocaleTimeString()}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
        </div>

        {event.registration?.note && (
          <div className="rounded-lg bg-muted p-2 text-xs text-muted-foreground">
            <span className="font-medium">Your note:</span> {event.registration.note}
          </div>
        )}

        {event.registration?.status !== "cancelled" && new Date(event.starts_at) > now && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancel.mutate(event.registration!.id)}
              disabled={cancel.isPending}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel registration
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">My Events</h2>
        <span className="text-sm text-muted-foreground">
          {registrations.length} registrations
        </span>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No upcoming events. Check the events page to register.
              </p>
            </div>
          ) : (
            upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {pastEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No past events yet.
              </p>
            </div>
          ) : (
            pastEvents.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};
