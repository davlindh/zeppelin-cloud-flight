import React from 'react';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { ClaimProjectBanner } from '@/components/projects/ClaimProjectBanner';
import { useCanEditProject } from '@/hooks/useCanEditProject';
import { useClaimableProject } from '@/hooks/useClaimableProject';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';

interface ProjectPermissionGuardProps {
  projectId: string;
  projectTitle: string;
  children: React.ReactNode;
}

export const ProjectPermissionGuard: React.FC<ProjectPermissionGuardProps> = ({
  projectId,
  projectTitle,
  children,
}) => {
  const { data: user } = useAuthenticatedUser();
  const { canEdit, isLoading: isCheckingPermission } = useCanEditProject(projectId);
  const { canClaim, isLoading: isCheckingClaim, projectEmail, confidence, matchCriteria } = useClaimableProject(projectId);

  if (isCheckingPermission || isCheckingClaim) {
    return (
      <EditPageLayout entityType="project" title="Kontrollerar behörigheter...">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">Kontrollerar behörigheter...</p>
        </div>
      </EditPageLayout>
    );
  }

  // Show claim banner if user can claim this project
  if (canClaim && user?.email) {
    return (
      <EditPageLayout entityType="project" title="Projektägarskap">
        <div className="p-6 max-w-3xl">
          <ClaimProjectBanner
            projectId={projectId}
            projectTitle={projectTitle}
            userEmail={user.email}
            confidence={confidence}
            matchCriteria={matchCriteria}
          />
        </div>
      </EditPageLayout>
    );
  }

  // Show permission denied if user cannot edit and cannot claim
  if (!canEdit && !canClaim) {
    return (
      <EditPageLayout entityType="project" title="Åtkomst nekad">
        <div className="p-6 max-w-3xl">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Åtkomst nekad</AlertTitle>
            <AlertDescription>
              Du har inte behörighet att redigera detta projekt. Endast projektägare och administratörer kan redigera projekt.
            </AlertDescription>
          </Alert>
        </div>
      </EditPageLayout>
    );
  }

  return <>{children}</>;
};
