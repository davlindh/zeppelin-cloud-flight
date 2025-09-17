import React from 'react';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';

export const ParticipantEditPage: React.FC = () => {
  return (
    <EditPageLayout
      entityType="participant"
      title="Redigera deltagare"
    >
      <AdminFormFactory
        entityType="participant"
        onClose={() => {}} // Handled by layout
        onSuccess={() => {}} // Handled by layout
      />
    </EditPageLayout>
  );
};
