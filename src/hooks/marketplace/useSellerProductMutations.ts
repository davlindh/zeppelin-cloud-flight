import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProductFormData } from '@/types/commerce';
import { useToast } from '@/hooks/use-toast';

export const useSellerProductMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Get current user's provider profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!provider) throw new Error('Provider profile not found');

      // Determine approval status - admins auto-approve
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin');
      const approvalStatus = isAdmin ? 'approved' : 'pending';

      const { data: product, error } = await supabase
        .from('products')
        .insert({
          title: data.title,
          description: data.description,
          selling_price: data.price,
          original_price: data.originalPrice,
          category_id: data.categoryId,
          product_brand: data.brand,
          images: data.images,
          image: data.images[0],
          stock_quantity: data.stockQuantity,
          in_stock: data.stockQuantity > 0,
          seller_id: provider.id,
          seller_type: 'provider',
          event_id: data.eventId,
          project_id: data.projectId,
          visibility: data.visibility,
          approval_status: approvalStatus,
          commission_rate: data.commissionRate || 0,
          features: data.features || [],
          tags: data.tags || [],
          rating: 0,
          reviews: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast({
        title: 'Product created',
        description: 'Your product has been submitted for review',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating product',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...data }: ProductFormData & { id: string }) => {
      const { data: product, error } = await supabase
        .from('products')
        .update({
          title: data.title,
          description: data.description,
          selling_price: data.price,
          original_price: data.originalPrice,
          category_id: data.categoryId,
          product_brand: data.brand,
          images: data.images,
          image: data.images[0],
          stock_quantity: data.stockQuantity,
          in_stock: data.stockQuantity > 0,
          event_id: data.eventId,
          project_id: data.projectId,
          visibility: data.visibility,
          commission_rate: data.commissionRate,
          features: data.features,
          tags: data.tags,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast({
        title: 'Product updated',
        description: 'Your changes have been saved',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating product',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast({
        title: 'Product deleted',
        description: 'The product has been removed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting product',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
