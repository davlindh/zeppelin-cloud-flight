import React from 'react';
import { EditPageLayout } from '../../components/admin/EditPageLayout';
import { AdminFormFactory } from '../../components/admin/AdminFormFactory';

export const SponsorEditPage: React.FC = () => {
  return (
    <EditPageLayout
      entityType="sponsor"
      title="Redigera sponsor"
    >
      <AdminFormFactory
        entityType="sponsor"
        onClose={() => {}} // Handled by layout
        onSuccess={() => {}} // Handled by layout
      />
    </EditPageLayout>
  );
};
