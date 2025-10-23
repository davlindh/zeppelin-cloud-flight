import React from 'react';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ClaimProfileBanner } from '@/components/participants/ClaimProfileBanner';
import { useCanEditParticipant } from '@/hooks/useCanEditParticipant';
import { useClaimableParticipant } from '@/hooks/useClaimableParticipant';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';

interface ParticipantPermissionGuardProps {
  participantId: string;
  participantName: string;
  children: React.ReactNode;
}

export const ParticipantPermissionGuard: React.FC<ParticipantPermissionGuardProps> = ({
  participantId,
  participantName,
  children,
}) => {
  const { data: user } = useAuthenticatedUser();
  const { canEdit, isLoading: isCheckingPermission } = useCanEditParticipant(participantId);
  const { canClaim, isLoading: isCheckingClaim } = useClaimableParticipant(participantId);

  if (isCheckingPermission || isCheckingClaim) {
    return (
      <EditPageLayout entityType="participant" title="Redigera deltagare">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">Kontrollerar behörigheter...</p>
        </div>
      </EditPageLayout>
    );
  }

  // Show claim banner if user can claim this profile
  if (canClaim && user?.email) {
    return (
      <EditPageLayout entityType="participant" title="Redigera deltagare">
        <div className="p-6 max-w-3xl">
          <ClaimProfileBanner
            participantId={participantId}
            participantName={participantName}
            userEmail={user.email}
          />
        </div>
      </EditPageLayout>
    );
  }

  // Show permission denied if user cannot edit and cannot claim
  if (!canEdit && !canClaim) {
    return (
      <EditPageLayout entityType="participant" title="Redigera deltagare">
        <div className="p-6 max-w-3xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Åtkomst nekad</AlertTitle>
            <AlertDescription>
              Du har inte behörighet att redigera denna deltagarprofil.
            </AlertDescription>
          </Alert>
        </div>
      </EditPageLayout>
    );
  }

  return <>{children}</>;
};
