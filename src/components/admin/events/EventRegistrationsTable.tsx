import * as React from "react";
import { useEventRegistrations } from "@/hooks/useEventRegistrations";
import { useRegistrationActions } from "@/hooks/useRegistrationActions";
import { useRealtimeSubscription } from "@/hooks/shared/useRealtimeSubscription";
import { Check, X, Clock, Users, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface EventRegistrationsTableProps {
  eventId: string;
}

export const EventRegistrationsTable: React.FC<EventRegistrationsTableProps> = ({
  eventId,
}) => {
  const { data: registrations = [], isLoading, refetch } = useEventRegistrations(eventId);
  const { updateRegistrationStatus, bulkUpdateStatus } = useRegistrationActions();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  useRealtimeSubscription({
    table: "event_registrations",
    event: "*",
    filter: `event_id=eq.${eventId}`,
    onChange: () => {
      refetch();
    },
  });

  const filteredRegistrations = React.useMemo(() => {
    if (statusFilter === "all") return registrations;
    return registrations.filter((r) => r.status === statusFilter);
  }, [registrations, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRegistrations.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    }
  };

  const handleBulkConfirm = () => {
    if (selectedIds.length === 0) return;
    bulkUpdateStatus.mutate({ registrationIds: selectedIds, status: "confirmed" });
    setSelectedIds([]);
  };

  const getStatusBadge = (status: string) => {
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

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlist">Waitlist</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          {selectedIds.length > 0 && (
            <Button
              size="sm"
              onClick={handleBulkConfirm}
              disabled={bulkUpdateStatus.isPending}
            >
              <Check className="mr-1 h-3 w-3" />
              Confirm {selectedIds.length} selected
            </Button>
          )}
        </div>
        
        <span className="text-sm text-muted-foreground">
          {filteredRegistrations.length} registrations
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(registration.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(registration.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {registration.user?.full_name || "Unknown"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {registration.user?.email}
                </TableCell>
                <TableCell>{getStatusBadge(registration.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(registration.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {registration.note || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {registration.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateRegistrationStatus.mutate({
                              registrationId: registration.id,
                              status: "confirmed",
                            })
                          }
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateRegistrationStatus.mutate({
                              registrationId: registration.id,
                              status: "waitlist",
                            })
                          }
                        >
                          <Users className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {registration.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateRegistrationStatus.mutate({
                            registrationId: registration.id,
                            status: "cancelled",
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
