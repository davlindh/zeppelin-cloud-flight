import * as React from "react";
import { Calendar, CheckCircle2, Users, Edit3 } from "lucide-react";
import type { Event } from "@/types/events";

interface EventTimelineProps {
  event: Event;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ event }) => {
  const milestones = React.useMemo(() => {
    const items = [
      {
        icon: Edit3,
        label: "Event created",
        date: event.created_at,
        status: "completed",
      },
    ];

    if (event.status === "published") {
      items.push({
        icon: CheckCircle2,
        label: "Published",
        date: event.updated_at,
        status: "completed",
      });
    }

    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);

    if (startsAt > now) {
      items.push({
        icon: Calendar,
        label: "Event starts",
        date: event.starts_at,
        status: "upcoming",
      });
    } else if (endsAt > now) {
      items.push({
        icon: Users,
        label: "Event in progress",
        date: event.starts_at,
        status: "active",
      });
    } else {
      items.push({
        icon: CheckCircle2,
        label: "Event completed",
        date: event.ends_at,
        status: "completed",
      });
    }

    return items;
  }, [event]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Event Timeline</h3>
      <div className="relative space-y-4">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
        {milestones.map((milestone, index) => {
          const Icon = milestone.icon;
          return (
            <div key={index} className="relative flex items-start gap-3">
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  milestone.status === "completed"
                    ? "border-primary bg-primary text-primary-foreground"
                    : milestone.status === "active"
                    ? "border-primary bg-background text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 pt-1">
                <div className="text-sm font-medium text-foreground">
                  {milestone.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(milestone.date).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
