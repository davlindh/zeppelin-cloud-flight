import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product, ProductVariant } from '@/types/unified';
import { transformNullableImage } from '@/utils/transforms';

interface DatabaseProduct {
  id: string;
  title: string;
  description: string;
  article_number: string | null;
  barcode: string | null;
  slug: string | null;
  cost_price: number | null;
  selling_price: number;
  original_price: number | null;
  tax_rate: number | null;
  category_id: string | null;
  product_brand: string | null;
  product_group: string | null;
  product_type: string | null;
  stock_quantity: number | null;
  unit: string | null;
  is_stock_item: boolean | null;
  in_stock: boolean | null;
  supplier: string | null;
  image: string | null;
  images: string[] | null;
  features: string[] | null;
  tags: string[] | null;
  rating: number | null;
  reviews: number | null;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    display_name: string;
  } | null;
  product_variants?: Array<{
    id: string;
    size?: string | null;
    color?: string | null;
    material?: string | null;
    stock_quantity: number | null;
  }>;
}

const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => {
  // Transform variants if they exist
  const variants: ProductVariant[] = dbProduct.product_variants?.map(variant => ({
    size: variant.size ?? undefined,
    color: variant.color ?? undefined,
    material: variant.material ?? undefined,
    stock: variant.stock_quantity ?? 0,
  })) ?? [];

  const transformed = {
    id: dbProduct.id,
    title: dbProduct.title,
    description: dbProduct.description,
    price: dbProduct.selling_price,
    originalPrice: dbProduct.original_price || undefined,
    categoryId: dbProduct.category_id || '',
    categoryName: dbProduct.category?.display_name || dbProduct.category?.name || 'General',
    rating: dbProduct.rating || 0,
    reviews: dbProduct.reviews || 0,
    inStock: dbProduct.in_stock || false,
    image: transformNullableImage(dbProduct.image),
    images: dbProduct.images || [],
    variants: variants,
    features: dbProduct.features || [],
    brand: dbProduct.product_brand || '',
    tags: dbProduct.tags || [],
    slug: dbProduct.slug || undefined,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at
  };

  console.log('useProducts transformDatabaseProduct:', {
    id: transformed.id,
    title: transformed.title,
    brand: transformed.brand,
    categoryName: transformed.categoryName,
    price: transformed.price,
    originalBrand: dbProduct.product_brand,
    originalCategory: dbProduct.category
  });

  return transformed;
};

export const useProducts = (filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<Product[]> => {
      console.log('🔍 useProducts: Fetching products from database with filters:', filters);
      
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            categories (
              name,
              display_name
            ),
            product_variants (
              id,
              size,
              color,
              material,
              stock_quantity
            )
          `)
          .eq('is_stock_item', true)
          .order('created_at', { ascending: false });

        // Apply category filter
        if (filters?.category && filters.category !== 'all') {
          console.log('🔍 Filtering by category:', filters.category);
          
          // Try both exact name match and case-insensitive match
          let { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id, name, display_name')
            .eq('name', filters.category.toLowerCase())
            .maybeSingle();

          // If not found by name, try by display_name
          if (!categoryData && !categoryError) {
            console.log('🔍 Category not found by name, trying display_name...');
            const result = await supabase
              .from('categories')
              .select('id, name, display_name')
              .eq('display_name', filters.category)
              .maybeSingle();
            categoryData = result.data;
            categoryError = result.error;
          }

          if (categoryError) {
            console.error('❌ Category lookup error:', categoryError);
            // Continue without category filter rather than failing
          } else if (categoryData) {
            console.log('✅ Found category:', categoryData);
            query = query.eq('category_id', categoryData.id);
          } else {
            console.warn('⚠️ Category not found:', filters.category);
            // Return empty results for invalid categories
            return [];
          }
        }

        // Enhanced search logic that includes category names and metadata
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          console.log('🔍 Enhanced search for:', searchTerm);
          
          // First, check if search term matches any category names
          const { data: matchingCategories } = await supabase
            .from('categories')
            .select('id, name, display_name')
            .or(`name.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`);
          
          if (matchingCategories && matchingCategories.length > 0) {
            console.log('🔍 Found matching categories:', matchingCategories.map(c => c.name));
            
            // If category matches, search both in products AND in that category
            const categoryIds = matchingCategories.map(c => c.id);
            const categoryCondition = categoryIds.map(id => `category_id.eq.${id}`).join(',');
            
            // Search in product fields OR in matching categories
            query = query.or([
              `title.ilike.%${searchTerm}%`,
              `description.ilike.%${searchTerm}%`,
              `product_brand.ilike.%${searchTerm}%`,
              `tags.cs.{${searchTerm}}`,
              categoryCondition
            ].join(','));
          } else {
            // Standard search if no categories match
            query = query.or([
              `title.ilike.%${searchTerm}%`,
              `description.ilike.%${searchTerm}%`,
              `product_brand.ilike.%${searchTerm}%`,
              `tags.cs.{${searchTerm}}`
            ].join(','));
          }
        }

        if (filters?.minPrice) {
          query = query.gte('selling_price', filters.minPrice);
        }

        if (filters?.maxPrice) {
          query = query.lte('selling_price', filters.maxPrice);
        }

        if (filters?.inStockOnly) {
          query = query.eq('in_stock', true);
        }

        const { data: productsData, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }

        console.log('🔍 useProducts: Fetched products from database:', {
          count: productsData?.length ?? 0,
          category: filters?.category,
          search: filters?.search,
          sampleProducts: productsData?.slice(0, 2).map(p => ({ id: p.id, title: p.title, category: p.category?.name }))
        });

        if (!productsData || productsData.length === 0) {
          console.warn('🔍 useProducts: No products found in database for filters:', filters);
          return [];
        }

        const transformedProducts = productsData.map(transformDatabaseProduct);
        console.log('🔍 useProducts: Transformed products:', {
          count: transformedProducts.length,
          sampleTransformed: transformedProducts.slice(0, 2).map(p => ({ id: p.id, title: p.title, categoryName: p.categoryName }))
        });
        
        return transformedProducts;
      } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      console.log('Fetching single product:', id);
      
      try {
        const { data: productData, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories!fk_products_category_id (
              name,
              display_name
            ),
            product_variants (
              id,
              size,
              color,
              material,
              stock_quantity
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching product:', error);
          throw error;
        }

        if (!productData) {
          console.warn('Product not found:', id);
          return null;
        }

        return transformDatabaseProduct(productData);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
