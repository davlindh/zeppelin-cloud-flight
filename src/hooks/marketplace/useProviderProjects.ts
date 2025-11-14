import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProviderProject {
  id: string;
  providerId: string;
  projectId: string;
  role: 'lead' | 'contributor' | 'consultant' | 'sponsor';
  contributionDescription?: string;
  startDate?: string;
  endDate?: string;
  isFeatured: boolean;
  showInPortfolio: boolean;
  project?: {
    id: string;
    title: string;
    description: string;
    image_path?: string;
    type?: string;
    tags?: string[];
  };
}

export function useProviderProjects(providerId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: providerProjects, isLoading } = useQuery({
    queryKey: ['provider-projects', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_provider_projects' as any)
        .select(`
          *,
          project:projects (
            id,
            title,
            description,
            image_path,
            type,
            tags
          )
        `)
        .eq('provider_id', providerId)
        .eq('show_in_portfolio', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        id: item.id,
        providerId: item.provider_id,
        projectId: item.project_id,
        role: item.role as 'lead' | 'contributor' | 'consultant' | 'sponsor',
        contributionDescription: item.contribution_description,
        startDate: item.start_date,
        endDate: item.end_date,
        isFeatured: item.is_featured,
        showInPortfolio: item.show_in_portfolio,
        project: Array.isArray(item.project) ? item.project[0] : item.project
      })) as ProviderProject[];
    },
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  });

  const generatePortfolioFromProject = useMutation({
    mutationFn: async ({ projectId, participantId }: { projectId: string; participantId: string }) => {
      const { data, error } = await supabase.rpc('auto_generate_portfolio_from_project' as any, {
        p_project_id: projectId,
        p_participant_id: participantId
      });

      if (error) throw error;
      
      const result = data as { success: boolean; message: string };
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['provider-projects', providerId] });
      queryClient.invalidateQueries({ queryKey: ['service-portfolio', providerId] });
      toast({
        title: 'Portfolio item created',
        description: 'Project has been added to your portfolio.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to generate portfolio: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const linkProjectToProvider = useMutation({
    mutationFn: async (data: {
      projectId: string;
      role: 'lead' | 'contributor' | 'consultant' | 'sponsor';
      contributionDescription?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('service_provider_projects' as any)
        .insert({
          provider_id: providerId,
          project_id: data.projectId,
          role: data.role,
          contribution_description: data.contributionDescription,
          show_in_portfolio: true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-projects', providerId] });
      toast({
        title: 'Project linked',
        description: 'Project has been linked to your profile.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to link project: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const unlinkProject = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('service_provider_projects' as any)
        .delete()
        .eq('id', linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-projects', providerId] });
      toast({
        title: 'Project unlinked',
        description: 'Project has been removed from your profile.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to unlink project: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    providerProjects: providerProjects || [],
    isLoading,
    generatePortfolioFromProject,
    linkProjectToProvider,
    unlinkProject,
  };
}
