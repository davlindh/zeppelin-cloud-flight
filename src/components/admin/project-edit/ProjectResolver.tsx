import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EditPageLayout } from '@/components/admin/EditPageLayout';

interface ProjectResolverProps {
  slug: string;
  projectData?: any; // For data passed from navigation state
  onResolved: (projectId: string, projectTitle: string) => void;
  onError: (error: Error) => void;
  children: React.ReactNode;
}

export const ProjectResolver: React.FC<ProjectResolverProps> = ({
  slug,
  projectData,
  onResolved,
  onError,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const resolveProjectId = async () => {
      // If we have project data from state, use that
      if (projectData?.id) {
        onResolved(projectData.id, projectData.title);
        setIsLoading(false);
        return;
      }

      if (!slug) {
        const err = new Error('No slug provided');
        setError(err);
        onError(err);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Resolving project from slug:', slug);

        // Try: treat as slug first
        const { data, error: slugError } = await supabase
          .from('projects')
          .select('id, title')
          .eq('slug', slug)
          .maybeSingle();

        // Fallback: treat as UUID (backward compatibility)
        if (!data && !slugError) {
          console.log('⚠️ Not found by slug, trying as UUID...');
          const { data: uuidData, error: uuidError } = await supabase
            .from('projects')
            .select('id, title')
            .eq('id', slug)
            .maybeSingle();

          if (uuidError) throw uuidError;
          if (!uuidData) {
            throw new Error(`Project not found: ${slug}`);
          }

          console.log('✅ Resolved project ID:', uuidData.id);
          onResolved(uuidData.id, uuidData.title);
        } else if (data) {
          console.log('✅ Resolved project ID:', data.id);
          onResolved(data.id, data.title);
        } else {
          throw new Error(`Project not found: ${slug}`);
        }
      } catch (err) {
        console.error('❌ Error resolving project:', err);
        const error = err instanceof Error ? err : new Error('Failed to load project');
        setError(error);
        onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    resolveProjectId();
  }, [slug, projectData, onResolved, onError]);

  if (isLoading) {
    return (
      <EditPageLayout entityType="project" title="Laddar projekt...">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="ml-3 text-muted-foreground">Laddar projekt...</p>
        </div>
      </EditPageLayout>
    );
  }

  if (error) {
    return (
      <EditPageLayout entityType="project" title="Projektfel">
        <div className="p-8">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <strong>Fel:</strong> {error.message}
          </div>
        </div>
      </EditPageLayout>
    );
  }

  return <>{children}</>;
};
