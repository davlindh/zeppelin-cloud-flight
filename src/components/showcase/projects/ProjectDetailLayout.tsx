import React from 'react';
import { ProjectDetailHero } from './ProjectDetailHero';
import { ProjectPurposeImpact } from './ProjectPurposeImpact';
import { ProjectTimelineBudget } from './ProjectTimelineBudget';
import { ProjectMediaSection } from './ProjectMediaSection';
import { ProjectLinksSection } from './ProjectLinksSection';
import { ProjectInfoSidebar } from './ProjectInfoSidebar';

interface ProjectDetailLayoutProps {
  project: {
    id: string;
    title: string;
    description: string;
    full_description?: string;
    image_path?: string;
    purpose?: string;
    expected_impact?: string;
    associations?: string[];
    tags?: string[];
    created_at: string;
    updated_at: string;
    participants?: Array<{
      id: string;
      name: string;
      role: string;
      avatar_path?: string;
      bio?: string;
    }>;
    sponsors?: Array<{
      id: string;
      name: string;
      type: string;
      logo_path?: string;
      website?: string;
    }>;
    links?: Array<{
      type: string;
      url: string;
    }>;
    media?: Array<{
      type: string;
      url: string;
      title: string;
      description?: string;
    }>;
    budget?: {
      amount?: number;
      currency?: string;
      breakdown?: Array<{ item: string; cost: number; }>;
    };
    timeline?: {
      start_date?: string;
      end_date?: string;
      milestones?: Array<{ date: string; title: string; description?: string; }>;
    };
    access?: {
      requirements?: string[];
      target_audience?: string;
      capacity?: number;
      registration_required?: boolean;
    };
  };
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ProjectDetailLayout: React.FC<ProjectDetailLayoutProps> = ({
  project,
  isAdmin,
  onEdit,
  onDelete
}) => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Hero Section */}
      <ProjectDetailHero
        project={{
          id: project.id,
          title: project.title,
          description: project.description,
          image_path: project.image_path,
          associations: project.associations || project.tags
        }}
        isAdmin={isAdmin}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16 max-w-8xl">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Purpose & Impact */}
            <ProjectPurposeImpact
              full_description={project.full_description}
              purpose={project.purpose}
              expected_impact={project.expected_impact}
            />

            {/* Timeline & Budget */}
            <ProjectTimelineBudget
              timeline={project.timeline}
              budget={project.budget}
            />

            {/* Media Gallery */}
            <ProjectMediaSection
              media={project.media}
              projectId={project.id}
            />

            {/* Project Links */}
            <ProjectLinksSection
              links={project.links}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProjectInfoSidebar
              created_at={project.created_at}
              access={project.access}
              participants={project.participants}
              sponsors={project.sponsors}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
