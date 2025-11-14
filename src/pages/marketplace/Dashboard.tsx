import React, { useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useRoleActionItems } from '@/hooks/useRoleActionItems';
import { RoleSwitcher } from '@/components/dashboard/RoleSwitcher';
import { ProviderDashboard } from './ProviderDashboard';
import { ParticipantDashboard } from './ParticipantDashboard';
import { CustomerDashboard } from './CustomerDashboard';
import { UserDashboard } from './UserDashboard';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { roles, isLoading } = useUserRole();
  const [activeRole, setActiveRole] = useActiveRole();

  // Auto-select best role on first load
  useEffect(() => {
    if (roles.length > 0 && !roles.includes(activeRole as any)) {
      const defaultRole = roles.includes('provider') ? 'provider' :
                         roles.includes('participant') ? 'participant' :
                         roles.includes('customer') ? 'customer' : 'customer';
      setActiveRole(defaultRole);
    }
  }, [roles, activeRole, setActiveRole]);

  // Get action counts for each role
  const { data: providerItems } = useRoleActionItems('provider');
  const { data: participantItems } = useRoleActionItems('participant');
  const { data: customerItems } = useRoleActionItems('customer');

  const actionCounts = {
    provider: (providerItems?.critical?.length || 0) + (providerItems?.recommended?.length || 0),
    participant: (participantItems?.critical?.length || 0) + (participantItems?.recommended?.length || 0),
    customer: (customerItems?.critical?.length || 0) + (customerItems?.recommended?.length || 0),
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // If user has only one role, show the unified dashboard
  if (roles.length === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <UserDashboard />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Role Switcher */}
      <div>
        <h1 className="text-4xl font-bold mb-4">Min Dashboard</h1>
        <RoleSwitcher
          roles={roles as string[]}
          activeRole={activeRole}
          onSwitch={setActiveRole}
          actionCounts={actionCounts}
        />
      </div>

      {/* Role-Specific Dashboard */}
      <div>
        {activeRole === 'provider' && <ProviderDashboard />}
        {activeRole === 'participant' && <ParticipantDashboard />}
        {activeRole === 'customer' && <CustomerDashboard />}
        {!['provider', 'participant', 'customer'].includes(activeRole) && <CustomerDashboard />}
      </div>
    </div>
  );
};
