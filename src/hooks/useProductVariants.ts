
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProductVariant } from '@/types/variants';

interface DatabaseProductVariant {
  id: string;
  product_id: string;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  sku?: string | null;
  price_adjustment?: number | null;
  stock_quantity?: number | null;
  created_at: string;
  updated_at: string;
}

const transformDatabaseVariant = (dbVariant: DatabaseProductVariant): ProductVariant => {
  return {
    size: dbVariant.size || undefined,
    color: dbVariant.color || undefined,
    material: dbVariant.material || undefined,
    stock: dbVariant.stock_quantity || 0,
  };
};

export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async (): Promise<ProductVariant[]> => {
      console.log('Fetching variants for product:', productId);
      
      try {
        const { data: variantsData, error } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching product variants:', error);
          throw error;
        }

        console.log('Fetched product variants:', variantsData);
        return variantsData?.map(transformDatabaseVariant) || [];
      } catch (error) {
        console.error('Failed to fetch product variants:', error);
        return [];
      }
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useAllProductVariants = () => {
  return useQuery({
    queryKey: ['all-product-variants'],
    queryFn: async (): Promise<Record<string, ProductVariant[]>> => {
      console.log('Fetching all product variants...');
      
      try {
        const { data: variantsData, error } = await supabase
          .from('product_variants')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching all product variants:', error);
          throw error;
        }

        console.log('Fetched all product variants:', variantsData);
        
        // Group variants by product_id
        const variantsByProduct: Record<string, ProductVariant[]> = {};
        variantsData?.forEach(variant => {
          if (!variantsByProduct[variant.product_id]) {
            variantsByProduct[variant.product_id] = [];
          }
          variantsByProduct[variant.product_id]?.push(transformDatabaseVariant(variant));
        });

        return variantsByProduct;
      } catch (error) {
        console.error('Failed to fetch all product variants:', error);
        return {};
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
