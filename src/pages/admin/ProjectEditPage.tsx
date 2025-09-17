import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { ProjectMediaLibrary } from '@/components/admin/ProjectMediaLibrary';

export const ProjectEditPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  // Get project data from navigation state if available
  const projectData = location.state?.projectData;

  // Determine if we're editing or creating
  const isEdit = !!projectId || !!projectData?.id;
  const pageTitle = isEdit ? 'Redigera projekt' : 'Lägg till nytt projekt';

  // Use the entityId from params or from the project data
  const currentProjectId = projectId || projectData?.id;

  return (
    <EditPageLayout
      entityType="project"
      title={pageTitle}
    >
      <div className="space-y-8">
        {/* Main project form */}
        <div className="max-w-none">
          <AdminFormFactory
            entityType="project"
            entityId={currentProjectId}
            initialData={projectData}
            onClose={() => {}} // Handled by layout
            onSuccess={() => {}} // Handled by layout
          />
        </div>

        {/* Project media library - only shown if we have a project ID */}
        {currentProjectId && (
          <div className="max-w-none">
            <ProjectMediaLibrary
              projectId={currentProjectId}
            />
          </div>
        )}
      </div>
    </EditPageLayout>
  );
};
