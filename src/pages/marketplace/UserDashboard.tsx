import React, { useState } from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useUserRole } from '@/hooks/useUserRole';
import { useRoleApplications } from '@/hooks/marketplace/useRoleApplications';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { RoleBadges } from '@/components/ui/role-badges';
import { RoleOverviewCard } from '@/components/dashboard/RoleOverviewCard';
import { UnlockRoleCard } from '@/components/dashboard/UnlockRoleCard';
import { ApplicationStatusCard } from '@/components/dashboard/ApplicationStatusCard';
import { ProviderApplicationForm } from '@/components/profile/ProviderApplicationForm';
import { Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const availableRoleUpgrades = [
  {
    role: 'provider',
    description: 'Erbjud dina tjänster till kunder',
    benefits: [
      'Skapa och hantera tjänsteutbud',
      'Ta emot bokningar från kunder',
      'Bygga och visa upp din portfolio',
      'Få betalt för dina tjänster',
    ],
  },
  {
    role: 'participant',
    description: 'Delta aktivt i våra projekt',
    benefits: [
      'Skapa din egen publika profil',
      'Delta i community-projekt',
      'Ladda upp media till din profil',
      'Nätverka med andra deltagare',
    ],
  },
];

export const UserDashboard: React.FC = () => {
  const { data: user, isLoading: userLoading } = useAuthenticatedUser();
  const { roles, isLoading: rolesLoading } = useUserRole();
  const { data: applications, isLoading: appsLoading } = useRoleApplications(user?.id);
  const [applicationDialogRole, setApplicationDialogRole] = useState<string | null>(null);

  if (userLoading || rolesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Du måste vara inloggad för att se din dashboard.</p>
        </Card>
      </div>
    );
  }

  const pendingApplications = applications?.filter(app => 
    app.status === 'pending' || app.status === 'under_review'
  ) || [];

  const availableUpgrades = availableRoleUpgrades.filter(
    upgrade => !(roles as string[]).includes(upgrade.role) && 
    !pendingApplications.some(app => app.requested_role === upgrade.role)
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Min Dashboard</h1>
        <p className="text-muted-foreground">
          Hantera dina roller och behörigheter
        </p>
      </div>

      {/* Current Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Mina Roller</CardTitle>
          <CardDescription>
            Du har för närvarande följande roller i systemet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleBadges roles={roles as string[]} size="lg" layout="inline" max={10} />
        </CardContent>
      </Card>

      {/* Role Capabilities */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Dina Behörigheter</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map(role => (
            <RoleOverviewCard key={role} role={role as any} />
          ))}
        </div>
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Pågående Ansökningar</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingApplications.map(app => (
              <ApplicationStatusCard key={app.id} application={app} />
            ))}
          </div>
        </div>
      )}

      {/* Available Upgrades */}
      {availableUpgrades.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Lås Upp Nya Roller
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {availableUpgrades.map(upgrade => (
              <UnlockRoleCard
                key={upgrade.role}
                role={upgrade.role}
                description={upgrade.description}
                benefits={upgrade.benefits}
                onApply={() => setApplicationDialogRole(upgrade.role)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Application Dialog */}
      <Dialog 
        open={!!applicationDialogRole} 
        onOpenChange={(open) => !open && setApplicationDialogRole(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ansök om ny roll</DialogTitle>
          </DialogHeader>
          {applicationDialogRole === 'provider' && (
            <ProviderApplicationForm 
              onSuccess={() => setApplicationDialogRole(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
