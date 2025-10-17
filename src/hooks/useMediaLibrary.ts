import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-extensions';
import { toast } from '@/hooks/use-toast';
import type { MediaLibraryItem, MediaFilters, MediaUpdateData } from '@/types/mediaLibrary';

// Create typed Supabase client with extended types
const supabaseUrl = 'https://paywaomkmjssbtkzwnwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXdhb21rbWpzc2J0a3p3bndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDg0NDIsImV4cCI6MjA3MzAyNDQ0Mn0.NkWnQCMJA3bZQy5746C_SmlWsT3pLnNOOLUNjlPv0tI';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Hook for managing media library
 * Provides functions for fetching, uploading, updating and deleting media
 */
export const useMediaLibrary = (filters?: MediaFilters) => {
  const queryClient = useQueryClient();

  // Fetch media with filters
  const { data: media, isLoading, error } = useQuery({
    queryKey: ['media-library', filters],
    queryFn: async (): Promise<MediaLibraryItem[]> => {
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        query = query.in('type', types);
      }

      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      if (filters?.source) {
        const sources = Array.isArray(filters.source) ? filters.source : [filters.source];
        query = query.in('source', sources);
      }

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters?.participant_id) {
        query = query.eq('participant_id', filters.participant_id);
      }

      if (filters?.submission_id) {
        query = query.eq('submission_id', filters.submission_id);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }

      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,filename.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update media metadata
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MediaUpdateData }) => {
      const query = supabase.from('media_library') as any;
      const { data, error } = await query
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MediaLibraryItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Success',
        description: 'Media updated successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to update media:', error);
      toast({
        title: 'Error',
        description: 'Failed to update media',
        variant: 'destructive',
      });
    },
  });

  // Delete media
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First get the media to delete from storage
      const { data: mediaItem } = await supabase
        .from('media_library')
        .select('bucket, storage_path')
        .eq('id', id)
        .single() as any;

      // Delete from storage
      if (mediaItem) {
        await supabase.storage
          .from((mediaItem as any).bucket)
          .remove([(mediaItem as any).storage_path]);
      }

      // Delete from database
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Success',
        description: 'Media deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to delete media:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'destructive',
      });
    },
  });

  // Bulk approve
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const query = supabase.from('media_library') as any;
      const { error } = await query
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Success',
        description: `${ids.length} media items approved`,
      });
    },
    onError: (error) => {
      console.error('Failed to approve media:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve media',
        variant: 'destructive',
      });
    },
  });

  // Bulk delete
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Get all media items to delete from storage
      const { data: mediaItems } = await supabase
        .from('media_library')
        .select('bucket, storage_path')
        .in('id', ids) as any;

      // Delete from storage
      if (mediaItems) {
        for (const item of mediaItems as any[]) {
          await supabase.storage
            .from(item.bucket)
            .remove([item.storage_path]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('media_library')
        .delete()
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Success',
        description: `${ids.length} media items deleted`,
      });
    },
    onError: (error) => {
      console.error('Failed to delete media:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete media',
        variant: 'destructive',
      });
    },
  });

  return {
    media: media || [],
    isLoading,
    error,
    updateMedia: updateMutation.mutate,
    deleteMedia: deleteMutation.mutate,
    bulkApprove: bulkApproveMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
  };
};
