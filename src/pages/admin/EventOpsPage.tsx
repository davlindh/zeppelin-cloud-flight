import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UnifiedDashboardLayout } from "@/components/layouts/UnifiedDashboardLayout";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEventStats } from "@/hooks/useEventStats";
import { EventRegistrationsTable } from "@/components/admin/events/EventRegistrationsTable";
import { EventTimeline } from "@/components/admin/events/EventTimeline";
import { ArrowLeft, Edit, QrCode, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/events";

export const EventOpsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: user } = useAuthenticatedUser();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async (): Promise<Event> => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId!)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!eventId,
  });

  const { data: stats, isLoading: statsLoading } = useEventStats(eventId!);

  if (eventLoading || statsLoading) {
    return (
      <UnifiedDashboardLayout role="admin">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </UnifiedDashboardLayout>
    );
  }

  if (!event || !stats) {
    return (
      <UnifiedDashboardLayout role="admin">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">Event not found</p>
        </div>
      </UnifiedDashboardLayout>
    );
  }

  return (
    <UnifiedDashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/events")}
              className="mb-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to events
            </Button>
            <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
            <p className="text-sm text-muted-foreground">
              {event.venue} • {new Date(event.starts_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/events/${eventId}/checkin`)}
            >
              <QrCode className="mr-1 h-4 w-4" />
              Check-in mode
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="mr-1 h-4 w-4" />
              Edit event
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">Capacity</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {stats.confirmed_count} / {stats.total_capacity}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stats.available_spots} spots available
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Confirmed</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {stats.confirmed_count}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stats.checked_in_count} checked in
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Pending</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {stats.pending_count}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Awaiting approval
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Waitlist</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {stats.waitlisted_count}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {stats.cancelled_count} cancelled
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div>
            <EventRegistrationsTable eventId={eventId!} />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-4">
              <EventTimeline event={event} />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Event Details</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium text-foreground">{event.status}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium text-foreground">{event.location || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Starts</dt>
                  <dd className="font-medium text-foreground">
                    {new Date(event.starts_at).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ends</dt>
                  <dd className="font-medium text-foreground">
                    {new Date(event.ends_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </UnifiedDashboardLayout>
  );
};
