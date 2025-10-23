import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  ProjectResolver,
  ProjectPermissionGuard,
  ProjectEditContent,
} from '@/components/admin/project-edit';

export const ProjectEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  // Get project data from navigation state if available
  const projectData = location.state?.projectData;

  const handleResolved = (id: string, title: string) => {
    setProjectId(id);
    setProjectTitle(title);
    setError(null);
  };

  const handleError = (err: Error) => {
    setError(err);
  };

  if (error) {
    // Handle error at top level if needed, but ProjectResolver should handle it
    return (
      <div className="p-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <strong>Fel:</strong> {error.message}
        </div>
      </div>
    );
  }

  return (
    <ProjectResolver
      slug={slug || ''}
      projectData={projectData}
      onResolved={handleResolved}
      onError={handleError}
    >
      {projectId && (
        <ProjectPermissionGuard
          projectId={projectId}
          projectTitle={projectTitle}
        >
          <ProjectEditContent
            projectId={projectId}
            projectTitle={projectTitle}
          />
        </ProjectPermissionGuard>
      )}
    </ProjectResolver>
  );
};
