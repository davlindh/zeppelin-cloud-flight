import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryAttribute {
  id?: string;
  name: string;
  data_type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
  value: any;
  enum_options?: string[]; // For enum type
}

export interface CategoryTag {
  id: string;
  name: string;
  category_id?: string; // null = global tag
  color_scheme?: any;
}

export interface CreateCategoryData {
  name: string;
  display_name: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
  attributes?: CategoryAttribute[];
  tags?: string[]; // tag IDs
  metadata?: any; // For color scheme, icon, etc.
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

export interface Category {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  parent_category_id?: string;
  sort_order: number;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
  attributes?: CategoryAttribute[];
  tags?: CategoryTag[];
  parent?: Category;
  children?: Category[];
  usage_stats?: {
    product_count: number;
    service_count: number;
    auction_count: number;
    total_items: number;
  };
}

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async (categoryData: CreateCategoryData): Promise<Category | null> => {
      console.log('Creating category:', categoryData);
      
      // Create the category first
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          display_name: categoryData.display_name,
          description: categoryData.description,
          parent_category_id: categoryData.parent_id,
          sort_order: categoryData.sort_order ?? 0,
          is_active: categoryData.is_active ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      console.log('Category created successfully:', data);

      // Create default metadata for the new category
      const defaultMetadata = {
        category_id: data.id,
        icon_name: 'Package', // Default icon
        color_scheme: {
          primary: '#3B82F6',
          secondary: '#EFF6FF',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200'
        },
        search_keywords: [categoryData.name],
        display_settings: {
          show_in_navigation: true,
          featured: false,
          sort_priority: categoryData.sort_order ?? 0
        },
        ...categoryData.metadata // Allow override of defaults
      };

      const { error: metadataError } = await supabase
        .from('category_metadata')
        .insert(defaultMetadata);

      if (metadataError) {
        console.warn('Error creating category metadata:', metadataError);
        // Don't throw error - category was created successfully
      } else {
        console.log('Category metadata created successfully');
      }

      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-names'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async (categoryData: UpdateCategoryData): Promise<Category | null> => {
      console.log('Updating category:', categoryData);
      
      const { id, attributes: _attributes, tags: _tags, ...updateData } = categoryData;
      
      // Map parent_id to parent_category_id for database
      const dbUpdateData = {
        ...updateData,
        parent_category_id: updateData.parent_id,
        parent_id: undefined
      };

      const { data, error } = await supabase
        .from('categories')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }

      console.log('Category updated successfully:', data);
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-names'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      console.log('Deleting category:', id);
      
      // Check if category has children
      const { data: children, error: childrenError } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_category_id', id);

      if (childrenError) {
        throw childrenError;
      }

      if (children && children.length > 0) {
        throw new Error('Cannot delete category with child categories. Please delete or move child categories first.');
      }

      // Check if category has associated items (products, services, auctions)
      const checkPromises = [
        supabase.from('products').select('id').eq('category_id', id).limit(1),
        supabase.from('services').select('id').eq('category', id as any).limit(1),
        supabase.from('auctions').select('id').eq('category', id as any).limit(1),
      ];

      const [productsCheck, servicesCheck, auctionsCheck] = await Promise.all(checkPromises);

      const hasProducts = productsCheck?.data && productsCheck.data.length > 0;
      const hasServices = servicesCheck?.data && servicesCheck.data.length > 0;
      const hasAuctions = auctionsCheck?.data && auctionsCheck.data.length > 0;

      if (hasProducts || hasServices || hasAuctions) {
        const itemTypes = [];
        if (hasProducts) itemTypes.push('products');
        if (hasServices) itemTypes.push('services');
        if (hasAuctions) itemTypes.push('auctions');
        
        throw new Error(`Cannot delete category with associated ${itemTypes.join(', ')}. Please move or delete these items first.`);
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }

      console.log('Category deleted successfully');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-names'] });
    },
  });

  const toggleCategoryStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }): Promise<Category | null> => {
      console.log('Toggling category status:', { id, is_active });
      
      const { data, error } = await supabase
        .from('categories')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling category status:', error);
        throw error;
      }

      console.log('Category status toggled successfully:', data);
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const bulkUpdateCategories = useMutation({
    mutationFn: async ({ 
      categoryIds, 
      updates 
    }: { 
      categoryIds: string[]; 
      updates: Partial<Pick<Category, 'is_active' | 'parent_category_id' | 'sort_order'>>; 
    }): Promise<Category[]> => {
      console.log('Bulk updating categories:', { categoryIds, updates });
      
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .in('id', categoryIds)
        .select();

      if (error) {
        console.error('Error bulk updating categories:', error);
        throw error;
      }

      console.log('Categories bulk updated successfully:', data);
      return data as Category[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const duplicateCategory = useMutation({
    mutationFn: async (categoryId: string): Promise<Category | null> => {
      console.log('Duplicating category:', categoryId);
      
      // Get original category
      const { data: originalCategory, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Get original category metadata
      const { data: originalMetadata } = await supabase
        .from('category_metadata')
        .select('*')
        .eq('category_id', categoryId)
        .single();

      const duplicatedData = {
        ...originalCategory,
        name: `${originalCategory.name}_copy`,
        display_name: `${originalCategory.display_name} (Copy)`,
        id: undefined, // Let DB generate new ID
        created_at: undefined,
        updated_at: undefined,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert(duplicatedData)
        .select()
        .single();

      if (error) {
        console.error('Error duplicating category:', error);
        throw error;
      }

      // Create metadata for duplicated category
      if (originalMetadata) {
        const duplicatedMetadata = {
          ...originalMetadata,
          id: undefined, // Let DB generate new ID
          category_id: data.id,
          created_at: undefined,
          updated_at: undefined,
        };

        const { error: metadataError } = await supabase
          .from('category_metadata')
          .insert(duplicatedMetadata);

        if (metadataError) {
          console.warn('Error duplicating category metadata:', metadataError);
        } else {
          console.log('Category metadata duplicated successfully');
        }
      }

      console.log('Category duplicated successfully:', data);
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Add cleanup function for orphaned categories
  const cleanupOrphanedCategories = useMutation({
    mutationFn: async (): Promise<{ deleted: string[], repaired: string[] }> => {
      console.log('Cleaning up orphaned categories...');
      
      // Get all categories and metadata
      const [categoriesResult, metadataResult] = await Promise.all([
        supabase.from('categories').select('id, name'),
        supabase.from('category_metadata').select('category_id')
      ]);

      if (categoriesResult.error || metadataResult.error) {
        throw categoriesResult.error || metadataResult.error;
      }

      const categories = categoriesResult.data ?? [];
      const metadataIds = new Set((metadataResult.data ?? []).map(m => m.category_id));
      
      // Find categories without metadata
      const orphanedCategories = categories.filter(cat => !metadataIds.has(cat.id));
      
      const deleted: string[] = [];
      const repaired: string[] = [];

      for (const orphan of orphanedCategories) {
        // Check if it's a duplicate (contains "_copy")
        if (orphan.name.includes('_copy')) {
          // Delete duplicate categories
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', orphan.id);
          
          if (!error) {
            deleted.push(orphan.name);
            console.log(`Deleted orphaned duplicate category: ${orphan.name}`);
          }
        } else {
          // Create missing metadata for legitimate categories
          const defaultMetadata = {
            category_id: orphan.id,
            icon_name: 'Package',
            color_scheme: {
              primary: '#3B82F6',
              secondary: '#EFF6FF',
              bg: 'bg-blue-50',
              text: 'text-blue-700',
              border: 'border-blue-200'
            },
            search_keywords: [orphan.name],
            display_settings: {
              show_in_navigation: true,
              featured: false,
              sort_priority: 0
            }
          };

          const { error } = await supabase
            .from('category_metadata')
            .insert(defaultMetadata);

          if (!error) {
            repaired.push(orphan.name);
            console.log(`Created metadata for orphaned category: ${orphan.name}`);
          }
        }
      }

      return { deleted, repaired };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-names'] });
    },
  });

  return {
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
    toggleCategoryStatus: toggleCategoryStatus.mutateAsync,
    bulkUpdateCategories: bulkUpdateCategories.mutateAsync,
    duplicateCategory: duplicateCategory.mutateAsync,
    cleanupOrphanedCategories: cleanupOrphanedCategories.mutateAsync,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
    isToggling: toggleCategoryStatus.isPending,
    isBulkUpdating: bulkUpdateCategories.isPending,
    isDuplicating: duplicateCategory.isPending,
    isCleaningUp: cleanupOrphanedCategories.isPending,
    error: createCategory.error ?? updateCategory.error ?? deleteCategory.error ?? 
           toggleCategoryStatus.error ?? bulkUpdateCategories.error ?? duplicateCategory.error ??
           cleanupOrphanedCategories.error,
  };
};
