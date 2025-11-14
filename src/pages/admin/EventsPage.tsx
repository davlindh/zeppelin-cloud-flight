import * as React from "react";
import { UnifiedDashboardLayout } from "@/components/layouts/UnifiedDashboardLayout";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { AdminEventsTable } from "@/components/admin/events/AdminEventsTable";
import { useToast } from "@/hooks/use-toast";

export const EventsPage: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { toast } = useToast();

  const handleCreate = () => {
    toast({
      title: "Event creation",
      description: "Event creation form will be implemented next.",
    });
  };

  return (
    <UnifiedDashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage events for the Gröna Huset × Zeppel Inn event series
          </p>
        </div>

        <AdminEventsTable onCreate={handleCreate} />
      </div>
    </UnifiedDashboardLayout>
  );
};
