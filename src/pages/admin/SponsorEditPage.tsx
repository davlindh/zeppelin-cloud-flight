import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditPageLayout } from '../../components/admin/EditPageLayout';
import { AdminFormFactory } from '../../components/admin/AdminFormFactory';
import { useSponsors } from '@/contexts/AdminContext';

export const SponsorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchSponsors } = useSponsors();

  const handleSuccess = async () => {
    await fetchSponsors();
    navigate('/admin/sponsors-management');
  };

  const handleClose = () => {
    navigate('/admin/sponsors-management');
  };

  return (
    <EditPageLayout
      entityType="sponsor"
      title="Redigera sponsor"
    >
      <AdminFormFactory
        entityType="sponsor"
        entityId={id}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </EditPageLayout>
  );
};
