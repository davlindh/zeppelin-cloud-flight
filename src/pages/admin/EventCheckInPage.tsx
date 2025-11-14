import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UnifiedDashboardLayout } from "@/components/layouts/UnifiedDashboardLayout";
import { useEventRegistrations } from "@/hooks/useEventRegistrations";
import { useRegistrationActions } from "@/hooks/useRegistrationActions";
import { useRealtimeSubscription } from "@/hooks/shared/useRealtimeSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Circle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/events";

export const EventCheckInPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: registrations = [], isLoading, refetch } = useEventRegistrations(eventId!);
  const { toggleCheckIn } = useRegistrationActions();

  useRealtimeSubscription({
    table: "event_registrations",
    event: "*",
    filter: `event_id=eq.${eventId}`,
    onChange: () => {
      refetch();
    },
  });

  const { data: event } = useQuery({
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

  const confirmedRegistrations = registrations.filter(
    (r) => r.status === "confirmed"
  );

  const checkedInCount = confirmedRegistrations.filter(
    (r) => r.checked_in_at
  ).length;

  if (isLoading) {
    return (
      <UnifiedDashboardLayout role="admin">
        <div className="h-screen animate-pulse rounded-2xl bg-muted" />
      </UnifiedDashboardLayout>
    );
  }

  return (
    <UnifiedDashboardLayout role="admin">
      <div className="min-h-screen space-y-4 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/events/${eventId}`)}
            className="mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to event
          </Button>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h1 className="text-xl font-bold text-foreground">{event?.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {checkedInCount} / {confirmedRegistrations.length} checked in
              </span>
              <span>
                {new Date(event?.starts_at || "").toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Check-in List */}
        <div className="space-y-2">
          {confirmedRegistrations.map((registration) => {
            const isCheckedIn = !!registration.checked_in_at;

            return (
              <button
                key={registration.id}
                onClick={() => toggleCheckIn.mutate(registration.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  isCheckedIn
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isCheckedIn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCheckedIn ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {registration.user?.full_name || "Unknown"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {registration.user?.email}
                    </div>
                  </div>

                  {isCheckedIn && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(registration.checked_in_at!).toLocaleTimeString()}
                    </div>
                  )}
                </div>

                {registration.note && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Note: {registration.note}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {confirmedRegistrations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No confirmed registrations yet
            </p>
          </div>
        )}
      </div>
    </UnifiedDashboardLayout>
  );
};
