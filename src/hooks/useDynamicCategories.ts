
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDynamicCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories from database...');
      
      try {
        // First get categories
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching categories:', error);
          throw error;
        }

        // Then get category metadata
        const { data: metadataData, error: metadataError } = await supabase
          .from('category_metadata')
          .select('*');

        if (metadataError) {
          console.warn('Error fetching category metadata:', metadataError);
        }

        console.log('Fetched categories:', categoriesData);
        console.log('Fetched metadata:', metadataData);
        
        // Transform the data to include metadata directly on the category object
        const transformedCategories = categoriesData?.map(category => {
          const metadata = metadataData?.find(m => m.category_id === category.id) || null;
          return {
            ...category,
            metadata
          };
        }) || [];

        return transformedCategories;
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

export const useDynamicCategoryNames = () => {
  return useQuery({
    queryKey: ['category-names'],
    queryFn: async () => {
      console.log('Fetching category names from database...');
      
      try {
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select('name, display_name')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching category names:', error);
          throw error;
        }

        console.log('Fetched category names:', categoriesData);
        
        // Return array of category names with 'all' prepended
        const categoryNames = ['all', ...(categoriesData?.map(cat => cat.name) || [])];
        return categoryNames;
      } catch (error) {
        console.error('Failed to fetch category names:', error);
        return ['all'];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
