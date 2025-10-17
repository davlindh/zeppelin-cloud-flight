import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShowcaseManagementList } from '@/components/admin/ShowcaseManagementList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const ProjectsManagementPage = () => {
  const navigate = useNavigate();

  const handleAddProject = () => {
    // TODO: Implement add project dialog/modal
    console.log('Add project');
  };

  const handleEditProject = (slug: string) => {
    navigate(`/admin/projects/${slug}/edit`);
  };

  const handleViewProject = (slug: string) => {
    navigate(`/showcase/${slug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projekt</h1>
          <p className="text-muted-foreground">
            Hantera showcase-projekt och presentationer
          </p>
        </div>
        <Button onClick={handleAddProject}>
          <Plus className="mr-2 h-4 w-4" />
          Lägg till projekt
        </Button>
      </div>

      <ShowcaseManagementList
        onAddShowcase={handleAddProject}
        onEditShowcase={handleEditProject}
        onViewShowcase={handleViewProject}
      />
    </div>
  );
};
