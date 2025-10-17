// Typed API Hooks using TanStack Query
// Foundation for replacing "any" types with proper TypeScript interfaces

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Project,
  ProjectWithRelations,
  ParticipantWithMedia,
  Sponsor,
  CreateProjectData,
  UpdateProjectData,
  ProjectRelationships
} from '@/types/api';

// Query Keys - centralized for consistency
export const queryKeys = {
  projects: ['projects'] as const,
  projectDetail: (slug: string) => ['projects', 'detail', slug] as const,
  participants: ['participants'] as const,
  participantDetail: (slug: string) => ['participants', 'detail', slug] as const,
  sponsors: ['sponsors'] as const,
};

// Error handling utility
const handleSupabaseError = (error: unknown, operation: string): never => {
  console.error(`[API Error] ${operation}:`, error);
  throw error;
};

// ============================
// PROJECT QUERIES
// ============================

/**
 * Fetch all projects - Basic implementation to replace "any" types
 */
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Unified Media Fetching System - Single Source for All Media Operations
 */
export const useUnifiedMedia = () => {
  return useQuery({
    queryKey: ['unified-media'],
    queryFn: async () => {
      console.log('🔍 useUnifiedMedia: Fetching all media from database');

      // Fetch all media from database
      const { data, error } = await supabase
        .from('project_media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🔍 useUnifiedMedia: Error fetching media:', error);
        throw error;
      }

      console.log('🔍 useUnifiedMedia: Raw media data:', data);
      console.log('🔍 useUnifiedMedia: Media count:', data?.length || 0);

      return {
        all: data || [],
        totalCount: data?.length || 0
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch a single project by slug or UUID with relationships
 * Handles both slug-based URLs and legacy UUID-based URLs
 */
export const useProject = (slugOrId: string) => {
  return useQuery({
    queryKey: queryKeys.projectDetail(slugOrId),
    queryFn: async () => {
      console.log('🔍 useProject: Fetching project with slugOrId:', slugOrId);

      // Check if the parameter looks like a UUID (36 characters with hyphens)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

      let query = supabase
        .from('projects')
        .select(`
          *,
          project_participants (
            role,
            participants!inner (
              id,
              name,
              bio,
              avatar_path,
              slug
            )
          ),
          project_sponsors (
            sponsors!inner (
              id,
              name,
              logo_path,
              website,
              type
            )
          ),
          project_links (type, url),
          project_media (
            id,
            type,
            url,
            title,
            description
          ),
          project_tags (tag),
          project_budget (amount, currency, breakdown),
          project_timeline (
            start_date,
            end_date,
            milestones
          ),
          project_access (
            requirements,
            target_audience,
            capacity,
            registration_required
          )
        `);

      // Use appropriate query based on parameter type
      query = isUUID ? query.eq('id', slugOrId) : query.eq('slug', slugOrId);

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('🔍 useProject: Project not found');
          return null; // Not found
        }
        console.error('🔍 useProject: Error fetching project:', error);
        throw error;
      }

      console.log('🔍 useProject: Raw data received:', data);
      console.log('🔍 useProject: project_media:', data?.project_media);
      console.log('🔍 useProject: project_media length:', data?.project_media?.length);

      return data;
    },
    enabled: !!slugOrId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ============================
// PARTICIPANT QUERIES
// ============================

/**
 * Fetch all participants - Basic implementation
 */
export const useParticipants = () => {
  return useQuery({
    queryKey: queryKeys.participants,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          project_participants (
            role,
            projects (
              id,
              slug,
              title,
              image_path
            )
          ),
          participant_media (
            id,
            type,
            category,
            url,
            title,
            description,
            year
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch a single participant by slug - Basic implementation
 */
export const useParticipant = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.participantDetail(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ============================
// SPONSOR QUERIES
// ============================

/**
 * Fetch all sponsors - Basic implementation
 */
export const useSponsors = () => {
  return useQuery({
    queryKey: queryKeys.sponsors,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (sponsors change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// ============================
// MUTATIONS
// ============================

/**
 * Create a new project with relationships
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectData,
      relationships
    }: {
      projectData: CreateProjectData;
      relationships?: ProjectRelationships;
    }): Promise<Project> => {
      try {
        // Create project first
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();

        if (projectError) throw projectError;

        // Create relationships if provided
        if (relationships) {
          await createProjectRelationships(project.id, relationships);
        }

        return project;
      } catch (error) {
        return handleSupabaseError(error, 'create project');
      }
    },
    onSuccess: () => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
};

/**
 * Update an existing project with relationships
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      projectData,
      relationships
    }: {
      projectId: string;
      projectData: UpdateProjectData;
      relationships?: ProjectRelationships;
    }): Promise<Project> => {
      try {
        // Update project first
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId)
          .select()
          .single();

        if (projectError) throw projectError;

        // Update relationships if provided
        if (relationships) {
          await updateProjectRelationships(projectId, relationships);
        }

        return project;
      } catch (error) {
        return handleSupabaseError(error, 'update project');
      }
    },
    onSuccess: (data) => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.projectDetail(data.slug) });
    },
  });
};

// ============================
// HELPER FUNCTIONS
// ============================

/**
 * Create project relationships
 */
async function createProjectRelationships(
  projectId: string,
  relationships: ProjectRelationships
): Promise<void> {
  const relationPromises = [];

  if (relationships.participants?.length) {
    relationPromises.push(
      supabase
        .from('project_participants')
        .insert(
          relationships.participants.map(p => ({
            project_id: projectId,
            participant_id: p.participant_id,
            role: p.role
          }))
        )
    );
  }

  if (relationships.sponsors?.length) {
    relationPromises.push(
      supabase
        .from('project_sponsors')
        .insert(
          relationships.sponsors.map(sponsor_id => ({
            project_id: projectId,
            sponsor_id
          }))
        )
    );
  }

  if (relationships.links?.length) {
    relationPromises.push(
      supabase
        .from('project_links')
        .insert(
          relationships.links.map(link => ({
            project_id: projectId,
            ...link
          }))
        )
    );
  }

  if (relationships.tags?.length) {
    relationPromises.push(
      supabase
        .from('project_tags')
        .insert(
          relationships.tags.map(tag => ({
            project_id: projectId,
            tag
          }))
        )
    );
  }

  if (relationships.media?.length) {
    relationPromises.push(
      supabase
        .from('project_media')
        .insert(
          relationships.media.map(media => ({
            project_id: projectId,
            ...media
          }))
        )
    );
  }

  // Note: Budget and timeline relationships require proper Json type handling
  // These will be implemented when the type definitions are properly aligned

  if (relationships.access) {
    relationPromises.push(
      supabase
        .from('project_access')
        .insert([{
          project_id: projectId,
          ...relationships.access
        }])
    );
  }

  await Promise.all(relationPromises);
}

/**
 * Update project relationships
 */
async function updateProjectRelationships(
  projectId: string,
  relationships: ProjectRelationships
): Promise<void> {
  // Delete existing relationships
  await Promise.all([
    supabase.from('project_participants').delete().eq('project_id', projectId),
    supabase.from('project_sponsors').delete().eq('project_id', projectId),
    supabase.from('project_links').delete().eq('project_id', projectId),
    supabase.from('project_tags').delete().eq('project_id', projectId),
    supabase.from('project_media').delete().eq('project_id', projectId),
    supabase.from('project_budget').delete().eq('project_id', projectId),
    supabase.from('project_timeline').delete().eq('project_id', projectId),
    supabase.from('project_access').delete().eq('project_id', projectId)
  ]);

  // Create new relationships
  await createProjectRelationships(projectId, relationships);
};

// ============================
// SUBMISSIONS QUERIES
// ============================

/**
 * Fetch all submissions - For admin submission inbox
 */
export const useSubmissions = () => {
  return useQuery({
    queryKey: ['submissions'] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (submissions change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Update submission status mutation
 */
export const useUpdateSubmissionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status
    }: {
      id: string;
      status: 'approved' | 'rejected';
    }) => {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          status,
          processed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
};

/**
 * Delete submission mutation
 */
export const useDeleteSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
};

/**
 * Delete sponsor mutation
 */
export const useDeleteSponsor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sponsors });
    },
  });
};
