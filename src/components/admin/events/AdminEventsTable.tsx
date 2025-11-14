import * as React from "react";
import { CalendarDays, MapPin, Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import type { Event } from "@/types/events";
import { Button } from "@/components/ui/button";
import { useRealtimeSubscription } from "@/hooks/shared/useRealtimeSubscription";

interface AdminEventsTableProps {
  onCreate?: () => void;
}

export const AdminEventsTable: React.FC<AdminEventsTableProps> = ({
  onCreate,
}) => {
  const navigate = useNavigate();
  const { data: events = [], isLoading, error, refetch } = useEvents({ includePast: true });

  // Real-time updates for events
  useRealtimeSubscription({
    table: "events",
    event: "*",
    onChange: () => {
      refetch();
    },
  });

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        Couldn&apos;t load events right now.
      </div>
    );
  }

  const eventsArray = Array.isArray(events) ? events : [];
  const publishedCount = eventsArray.filter((e) => e.status === "published").length;
  const draftCount = eventsArray.filter((e) => e.status === "draft").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Event series – Gröna Huset × Zeppel
        </h2>
        <Button
          onClick={onCreate}
          size="sm"
          className="inline-flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          New event
        </Button>
      </div>

      {/* Quick metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">Total events</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{eventsArray.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">Published</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{publishedCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">Draft</div>
          <div className="mt-1 text-2xl font-bold text-slate-600">{draftCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[2fr,1.5fr,1fr,1fr,auto] gap-2 border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-500 md:grid">
          <div>Event</div>
          <div>Venue</div>
          <div>Starts</div>
          <div>Status</div>
          <div />
        </div>

        <div className="divide-y divide-slate-100">
          {eventsArray.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-slate-500">
              No events yet. Create your first event for the Gröna Huset × Zeppel series.
            </div>
          ) : (
            eventsArray.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => navigate(`/admin/events/${event.id}`)}
                className="grid w-full grid-cols-1 gap-2 px-3 py-3 text-left text-sm hover:bg-slate-50 md:grid-cols-[2fr,1.5fr,1fr,1fr,auto]"
              >
                <div>
                  <div className="font-medium text-slate-900">{event.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(event.starts_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {event.venue || "TBA"}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(event.ends_at).toLocaleTimeString()}
                </div>
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      event.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : event.status === "draft"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-slate-900 text-slate-50"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  {event.capacity} spots
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
