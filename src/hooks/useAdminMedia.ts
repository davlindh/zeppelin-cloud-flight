import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MediaLibraryItem } from '@/types/mediaLibrary';

export const useAdminMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update media item
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MediaLibraryItem> }) => {
      const { error } = await supabase
        .from('media_library')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Media uppdaterad',
        description: 'Media-filen har uppdaterats.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fel',
        description: 'Kunde inte uppdatera media-filen.',
        variant: 'destructive',
      });
    },
  });

  // Delete media item
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get media item to delete storage file
      const { data: item } = await supabase
        .from('media_library')
        .select('bucket, storage_path')
        .eq('id', id)
        .single();

      // Delete from storage
      if (item?.bucket && item?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from(item.bucket)
          .remove([item.storage_path]);
        
        if (storageError) console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Media borttagen',
        description: 'Media-filen har tagits bort.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fel',
        description: 'Kunde inte ta bort media-filen.',
        variant: 'destructive',
      });
    },
  });

  // Bulk approve
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('media_library')
        .update({ status: 'approved' })
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Media godkända',
        description: `${ids.length} mediafil${ids.length !== 1 ? 'er' : ''} har godkänts.`,
      });
    },
  });

  // Bulk delete
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Get items to delete storage files
      const { data: items } = await supabase
        .from('media_library')
        .select('bucket, storage_path')
        .in('id', ids);

      // Delete from storage
      if (items) {
        for (const item of items) {
          if (item.bucket && item.storage_path) {
            await supabase.storage
              .from(item.bucket)
              .remove([item.storage_path]);
          }
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
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Media borttagna',
        description: `${ids.length} mediafil${ids.length !== 1 ? 'er' : ''} har tagits bort.`,
      });
    },
  });

  // Bulk tag
  const bulkTagMutation = useMutation({
    mutationFn: async ({ ids, tags }: { ids: string[]; tags: string[] }) => {
      // Get current tags for each item and merge with new tags
      const updates = ids.map(async (id) => {
        const { data: item } = await supabase
          .from('media_library')
          .select('tags')
          .eq('id', id)
          .single();

        const currentTags = item?.tags || [];
        const newTags = [...new Set([...currentTags, ...tags])];

        return supabase
          .from('media_library')
          .update({ tags: newTags })
          .eq('id', id);
      });

      await Promise.all(updates);
    },
    onSuccess: (_, { ids }) => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Taggar tillagda',
        description: `Taggar har lagts till på ${ids.length} mediafil${ids.length !== 1 ? 'er' : ''}.`,
      });
    },
  });

  // Change status
  const bulkChangeStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: MediaLibraryItem['status'] }) => {
      const { error } = await supabase
        .from('media_library')
        .update({ status })
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: (_, { ids, status }) => {
      queryClient.invalidateQueries({ queryKey: ['unified-media'] });
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({
        title: 'Status ändrad',
        description: `${ids.length} mediafil${ids.length !== 1 ? 'er' : ''} har ändrats till ${status}.`,
      });
    },
  });

  return {
    updateMedia: updateMutation.mutateAsync,
    deleteMedia: deleteMutation.mutateAsync,
    bulkApprove: bulkApproveMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    bulkTag: bulkTagMutation.mutateAsync,
    bulkChangeStatus: bulkChangeStatusMutation.mutateAsync,
    
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkOperating: bulkApproveMutation.isPending || bulkDeleteMutation.isPending || bulkTagMutation.isPending || bulkChangeStatusMutation.isPending,
  };
};
