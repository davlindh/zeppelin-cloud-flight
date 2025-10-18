import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { EditPageLayout } from '@/components/admin/EditPageLayout';
import { AdminFormFactory } from '@/components/admin/AdminFormFactory';
import { ProjectMediaLibrary } from '@/components/admin/ProjectMediaLibrary';
import { SponsorSelector } from '@/components/admin/project/SponsorSelector';
import { supabase } from '@/integrations/supabase/client';

export const ProjectEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [isLoadingId, setIsLoadingId] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get project data from navigation state if available
  const projectData = location.state?.projectData;

  useEffect(() => {
    const resolveProjectId = async () => {
      // If we have project data from state, use that
      if (projectData?.id) {
        setProjectId(projectData.id);
        setIsLoadingId(false);
        return;
      }

      if (!slug) {
        setError(new Error('No slug provided'));
        setIsLoadingId(false);
        return;
      }
      
      try {
        console.log('🔍 Resolving project from slug:', slug);
        
        // Try: treat as slug first
        let { data, error: slugError } = await supabase
          .from('projects')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        // Fallback: treat as UUID (backward compatibility)
        if (!data && !slugError) {
          console.log('⚠️ Not found by slug, trying as UUID...');
          const { data: uuidData, error: uuidError } = await supabase
            .from('projects')
            .select('id')
            .eq('id', slug)
            .maybeSingle();
          
          data = uuidData;
          if (uuidError) throw uuidError;
        }

        if (slugError) throw slugError;
        
        if (!data) {
          throw new Error(`Project not found: ${slug}`);
        }

        console.log('✅ Resolved project ID:', data.id);
        setProjectId(data.id);
      } catch (err) {
        console.error('❌ Error resolving project:', err);
        setError(err instanceof Error ? err : new Error('Failed to load project'));
      } finally {
        setIsLoadingId(false);
      }
    };

    resolveProjectId();
  }, [slug, projectData]);

  // Determine if we're editing or creating
  const isEdit = !!projectId || !!projectData?.id;
  const pageTitle = isEdit ? 'Redigera projekt' : 'Lägg till nytt projekt';

  if (isLoadingId) {
    return (
      <EditPageLayout entityType="project" title={pageTitle}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">Laddar projekt...</p>
        </div>
      </EditPageLayout>
    );
  }

  if (error) {
    return (
      <EditPageLayout entityType="project" title={pageTitle}>
        <div className="p-8">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <strong>Fel:</strong> {error.message}
          </div>
        </div>
      </EditPageLayout>
    );
  }

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
            entityId={projectId}
            initialData={projectData}
            onClose={() => window.history.back()}
            onSuccess={() => window.history.back()}
          />
        </div>

        {/* Project media library - only shown if we have a project ID */}
        {projectId && (
          <>
            <div className="max-w-none">
              <ProjectMediaLibrary
                projectId={projectId}
              />
            </div>

            {/* Sponsor selector */}
            <div className="max-w-none">
              <SponsorSelector
                projectId={projectId}
              />
            </div>
          </>
        )}
      </div>
    </EditPageLayout>
  );
};
