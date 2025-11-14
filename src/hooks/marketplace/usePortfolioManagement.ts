import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ServicePortfolioItem } from '@/types/unified';

export function usePortfolioManagement(providerId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPortfolioItem = useMutation({
    mutationFn: async (data: Partial<ServicePortfolioItem>) => {
      const { data: result, error } = await supabase
        .from('service_portfolio_items')
        .insert({
          provider_id: providerId,
          title: data.title,
          description: data.description,
          image: data.image,
          images: data.images || [],
          category: data.category,
          tags: data.tags || [],
          project_date: data.projectDate,
          client_name: data.clientName,
          project_url: data.projectUrl,
          featured: data.featured || false,
          display_order: data.displayOrder || 0,
          testimonial: data.testimonial,
          before_image: data.beforeImage,
          after_image: data.afterImage,
          project_value: data.projectValue,
          auto_generated: false,
          source_type: 'manual'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-portfolio', providerId] });
      toast({
        title: 'Portfolio item created',
        description: 'Your portfolio item has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create portfolio item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updatePortfolioItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServicePortfolioItem> }) => {
      const { data: result, error } = await supabase
        .from('service_portfolio_items')
        .update({
          title: data.title,
          description: data.description,
          image: data.image,
          images: data.images,
          category: data.category,
          tags: data.tags,
          project_date: data.projectDate,
          client_name: data.clientName,
          project_url: data.projectUrl,
          featured: data.featured,
          display_order: data.displayOrder,
          testimonial: data.testimonial,
          before_image: data.beforeImage,
          after_image: data.afterImage,
          project_value: data.projectValue,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-portfolio', providerId] });
      toast({
        title: 'Portfolio item updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update portfolio item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deletePortfolioItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-portfolio', providerId] });
      toast({
        title: 'Portfolio item deleted',
        description: 'The portfolio item has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete portfolio item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const uploadPortfolioImage = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${providerId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('service-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: `Failed to upload image: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    uploadPortfolioImage,
  };
}
