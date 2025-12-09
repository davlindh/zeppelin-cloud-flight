import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UnifiedDashboardLayout } from "@/components/layouts/UnifiedDashboardLayout";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEventStats } from "@/hooks/useEventStats";
import { EventRegistrationsTable } from "@/components/admin/events/EventRegistrationsTable";
import { EventTimeline } from "@/components/admin/events/EventTimeline";
import { EventTicketsTab } from "@/components/admin/events/EventTicketsTab";
import { EventTicketOrdersTab } from "@/components/admin/events/EventTicketOrdersTab";
import { EventCampaignsTab } from "@/components/admin/events/EventCampaignsTab";
import { EventCheckInTab } from "@/components/admin/events/EventCheckInTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, QrCode, Users, CheckCircle2, Clock, AlertCircle, Ticket, Target, ScanLine, Settings } from "lucide-react";
import { EventEditForm } from "@/components/admin/events/EventEditForm";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/events";

const EventOpsPage: React.FC = () => {
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

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['event-campaigns', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('funding_campaigns')
        .select('*')
        .eq('event_id', eventId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!eventId,
  });

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const editTab = document.querySelector('[data-state="inactive"][value="edit"]') as HTMLElement;
                editTab?.click();
              }}
            >
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

        {/* Main Content with Tabs */}
        <Tabs defaultValue="registrations" className="w-full">
          <TabsList>
            <TabsTrigger value="registrations">
              <Users className="mr-2 h-4 w-4" />
              Registrations
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Ticket className="mr-2 h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="orders">
              Orders
            </TabsTrigger>
            <TabsTrigger value="checkin">
              <ScanLine className="mr-2 h-4 w-4" />
              Check-In
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Target className="mr-2 h-4 w-4" />
              Campaigns {campaigns && campaigns.length > 0 && `(${campaigns.length})`}
            </TabsTrigger>
            <TabsTrigger value="details">
              <Clock className="mr-2 h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="edit">
              <Settings className="mr-2 h-4 w-4" />
              Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div>
                <EventRegistrationsTable eventId={eventId!} />
              </div>
              <div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <EventTimeline event={event} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <EventTicketsTab eventId={eventId!} eventTitle={event.title} />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <EventTicketOrdersTab eventId={eventId!} />
          </TabsContent>

          <TabsContent value="checkin" className="mt-6">
            <EventCheckInTab eventId={eventId!} />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <EventCampaignsTab 
              eventId={eventId!} 
              campaigns={campaigns || []} 
              isLoading={campaignsLoading} 
            />
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Event Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-muted-foreground">Status</dt>
                    <dd className="font-medium text-foreground mt-1">{event.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Location</dt>
                    <dd className="font-medium text-foreground mt-1">{event.location || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Venue</dt>
                    <dd className="font-medium text-foreground mt-1">{event.venue || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Starts</dt>
                    <dd className="font-medium text-foreground mt-1">
                      {new Date(event.starts_at).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Ends</dt>
                    <dd className="font-medium text-foreground mt-1">
                      {new Date(event.ends_at).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <EventTimeline event={event} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="mt-6">
            <EventEditForm event={event} />
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedDashboardLayout>
  );
};

export default EventOpsPage;
