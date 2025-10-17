import React from 'react';
import { ProjectDetailHero } from './ProjectDetailHero';
import { ProjectPurposeImpact } from './ProjectPurposeImpact';
import { ProjectTimelineBudget } from './ProjectTimelineBudget';
import { ProjectMediaSection } from './ProjectMediaSection';
import { ProjectLinksSection } from './ProjectLinksSection';
import { ProjectInfoSidebar } from './ProjectInfoSidebar';

interface ProjectDetailLayoutProps {
  project: {
    // Basic project data
    id: string;
    title: string;
    description: string;
    full_description?: string;
    image_path?: string;
    purpose?: string;
    expected_impact?: string;
    associations?: string[];
    created_at: string;
    updated_at: string;

    // Backwards compatibility (transformed data)
    tags?: string[];
    participants?: Array<{
      id: string;
      name: string;
      role: string;
      avatar_path?: string;
      bio?: string;
      slug?: string;
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
    budget?: any; // Now can be array or object for full flexibility
    timeline?: any; // Now can be array or object for full flexibility
    access?: any; // Now can be array or object for full flexibility

    // Raw database relationships (showing ALL available data)
    project_tags?: any[];
    project_participants?: any[];
    project_sponsors?: any[];
    project_links?: any[];
    project_media?: any[]; // Complete media data with ALL metadata
    project_budget?: any[]; // Full budget records
    project_timeline?: any[]; // Full timeline records
    project_access?: any[]; // Full access records
    project_voting?: any[]; // Full voting data if available
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
          associations: project.associations || project.tags,
          media: project.media
        }}
        isAdmin={isAdmin}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 md:gap-16 max-w-8xl">
          {/* Main Content */}
          <div className="space-y-10 md:space-y-12 animate-fade-in">
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

            {/* Media Gallery - NOW SHOWING ALL DATABASE DATA */}
            <ProjectMediaSection
              media={project.media}
              projectId={project.id}
              rawData={{
                project_media: project.project_media // Raw database media data
              }}
            />

            {/* Project Links */}
            <ProjectLinksSection
              links={project.links}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:self-start space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <ProjectInfoSidebar
              created_at={project.created_at}
              access={project.access}
              participants={project.participants}
              sponsors={project.sponsors}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};
