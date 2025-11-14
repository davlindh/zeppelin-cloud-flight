import * as React from "react";
import { useEvents } from "@/hooks/useEvents";
import { useMyRegistrations } from "@/hooks/useMyRegistrations";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { useRealtimeSubscription } from "@/hooks/shared/useRealtimeSubscription";
import { CalendarDays, MapPin, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const UpcomingEventsSection: React.FC = () => {
  const { data: events = [], isLoading, refetch } = useEvents({ status: "published" });
  const { data: registrations = [], refetch: refetchRegistrations } = useMyRegistrations();
  const { data: user } = useAuthenticatedUser();
  const { register } = useEventRegistration();
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Real-time updates
  useRealtimeSubscription({
    table: "events",
    event: "*",
    onChange: () => {
      refetch();
    },
  });

  useRealtimeSubscription({
    table: "event_registrations",
    event: "*",
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    onChange: () => {
      refetchRegistrations();
    },
  });

  const registrationsArray = Array.isArray(registrations) ? registrations : [];
  const eventsArray = Array.isArray(events) ? events : [];

  const registrationsByEventId = React.useMemo(
    () =>
      Object.fromEntries(
        registrationsArray.map((r) => [r.event_id, r.status] as const)
      ),
    [registrationsArray]
  );

  const handleRegister = async () => {
    if (!selectedEventId || !user?.id) return;

    await register.mutateAsync({
      eventId: selectedEventId,
      userId: user.id,
      note: note.trim() || undefined,
    });

    setIsDialogOpen(false);
    setSelectedEventId(null);
    setNote("");
  };

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (!eventsArray.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        No upcoming events yet. Stay tuned for new sessions at Gröna Huset & Zeppel Inn.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Upcoming events</h2>
        <span className="text-xs text-slate-500">
          Curated series · limited spots
        </span>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {eventsArray.map((event) => {
          const status = registrationsByEventId[event.id];
          const isPast = new Date(event.starts_at) < new Date();
          
          return (
            <div
              key={event.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
            >
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {event.venue ?? "Gröna Huset / Zeppel"}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {event.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(event.starts_at).toLocaleString()}
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.capacity} spots
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                {status ? (
                  <span
                    className={`text-[11px] font-medium uppercase tracking-wide ${
                      status === "confirmed"
                        ? "text-emerald-600"
                        : status === "pending"
                        ? "text-amber-600"
                        : status === "waitlist"
                        ? "text-slate-600"
                        : "text-slate-400"
                    }`}
                  >
                    {status === "confirmed" ? "✓ Confirmed" : `${status}`}
                  </span>
                ) : isPast ? (
                  <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Event passed
                  </span>
                ) : (
                  <Dialog open={isDialogOpen && selectedEventId === event.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                      setSelectedEventId(null);
                      setNote("");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => setSelectedEventId(event.id)}
                        className="inline-flex items-center gap-1 text-[11px]"
                      >
                        Request spot
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register for {event.title}</DialogTitle>
                        <DialogDescription>
                          Submit your registration request. You&apos;ll receive a
                          confirmation once approved.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="note"
                            className="text-sm font-medium text-slate-900"
                          >
                            Additional note (optional)
                          </label>
                          <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Any questions or special requirements?"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            setSelectedEventId(null);
                            setNote("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleRegister} disabled={register.isPending}>
                          {register.isPending ? "Submitting..." : "Submit registration"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
