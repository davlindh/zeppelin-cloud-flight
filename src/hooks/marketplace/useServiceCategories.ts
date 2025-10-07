
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useServiceCategories = () => {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async (): Promise<string[]> => {
      console.log('Fetching service categories from database');
      
      try {
        const { data: categoriesData, error } = await supabase
          .from('services')
          .select('category')
          .not('category', 'is', null);

        if (error) {
          console.error('Error fetching service categories:', error);
          throw error;
        }

        // Get unique categories
        const uniqueCategories = [...new Set(categoriesData?.map(item => item.category) || [])];
        console.log('Fetched service categories:', uniqueCategories);
        
        return uniqueCategories;
      } catch (error) {
        console.error('Failed to fetch service categories:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
