import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditPageLayout } from '../../components/admin/EditPageLayout';
import { AdminFormFactory } from '../../components/admin/AdminFormFactory';
import { useSponsors } from '@/contexts/AdminContext';
import { useCanEditSponsor } from '@/hooks/useCanEditSponsor';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export const SponsorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchSponsors } = useSponsors();
  const { data: user, isLoading: isLoadingUser } = useAuthenticatedUser();
  const { canEdit, isLoading: isLoadingPermission } = useCanEditSponsor(id);

  const handleSuccess = async () => {
    await fetchSponsors();
    navigate('/admin/sponsors-management');
  };

  const handleClose = () => {
    navigate('/admin/sponsors-management');
  };

  if (isLoadingUser || isLoadingPermission) {
    return (
      <EditPageLayout entityType="sponsor" title="Redigera sponsor">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">Kontrollerar behörigheter...</p>
        </div>
      </EditPageLayout>
    );
  }

  if (!canEdit && user) {
    return (
      <EditPageLayout entityType="sponsor" title="Redigera sponsor">
        <Alert variant="destructive" className="m-8">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Åtkomst nekad</AlertTitle>
          <AlertDescription>
            Du har inte behörighet att redigera denna sponsor. Endast administratörer kan redigera sponsorer.
          </AlertDescription>
        </Alert>
      </EditPageLayout>
    );
  }

  return (
    <EditPageLayout
      entityType="sponsor"
      title="Redigera sponsor"
    >
      <AdminFormFactory
        entityType="sponsor"
        entityId={id}
        renderMode="page"
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </EditPageLayout>
  );
};
