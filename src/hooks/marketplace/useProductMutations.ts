import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/unified';

interface CreateProductData {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId?: string;
  brand?: string;
  features?: string[];
  tags?: string[];
  variants?: Array<{
    color?: string;
    size?: string;
    stock: number;
  }>;
  images?: string[];
  image?: string;
}

interface UpdateProductData extends CreateProductData {
  id: string;
}

const mapToProduct = (
  dbProduct: any,
  fallback: { category?: string; categoryId?: string; variants?: CreateProductData['variants'] }
): Product => ({
  id: dbProduct.id,
  title: dbProduct.title,
  description: dbProduct.description,
  price: dbProduct.selling_price,
  originalPrice: dbProduct.original_price ?? undefined,
  categoryId: fallback.categoryId ?? dbProduct.category_id ?? '',
  categoryName: fallback.category ?? 'General',
  brand: dbProduct.product_brand ?? '',
  features: dbProduct.features ?? [],
  tags: dbProduct.tags ?? [],
  variants: fallback.variants ?? [],
  images: dbProduct.images ?? [],
  image: dbProduct.image ?? '',
  inStock: dbProduct.in_stock ?? false,
  rating: dbProduct.rating ?? 0,
  reviews: dbProduct.reviews ?? 0,
});

const buildProductPayload = (productData: CreateProductData, totalStock: number) => ({
  title: productData.title,
  description: productData.description,
  selling_price: productData.price,
  original_price: productData.originalPrice,
  category_id: productData.categoryId || null,
  product_brand: productData.brand,
  features: productData.features ?? [],
  tags: productData.tags ?? [],
  images: productData.images ?? [],
  image: productData.image ?? (productData.images?.[0] ?? ''),
  stock_quantity: totalStock,
  in_stock: totalStock > 0,
  rating: 0,
  reviews: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const useProductMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createProduct = async (productData: CreateProductData): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const totalStock =
        productData.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0;

      const payload = buildProductPayload(productData, totalStock);
      console.log('[useProductMutations] Creating product with data:', payload);

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('[useProductMutations] Product creation error:', error);
        throw new Error(`Failed to create product: ${error.message}`);
      }

      if (productData.variants?.length) {
        const timestamp = new Date().toISOString();
        const variantPayload = productData.variants.map(variant => ({
          product_id: data.id,
          color: variant.color,
          size: variant.size,
          stock_quantity: variant.stock,
          created_at: timestamp,
          updated_at: timestamp,
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantPayload);

        if (variantError) {
          console.warn('[useProductMutations] Failed to create variants:', variantError);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] });

      return mapToProduct(data, {
        category: productData.category,
        categoryId: productData.categoryId,
        variants: productData.variants,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred while creating product';
      console.error('[useProductMutations] Create product error:', err);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (productData: UpdateProductData): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const totalStock =
        productData.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0;

      const payload = {
        ...buildProductPayload(productData, totalStock),
        updated_at: new Date().toISOString(),
      };

      console.log('[useProductMutations] Updating product:', productData.id);

      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productData.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('[useProductMutations] Product update error:', error);
        throw new Error(`Failed to update product: ${error.message}`);
      }

      if (!data) {
        throw new Error('Product not found or update failed');
      }

      if (productData.variants) {
        await supabase.from('product_variants').delete().eq('product_id', productData.id);

        if (productData.variants.length > 0) {
          const timestamp = new Date().toISOString();
          const variantPayload = productData.variants.map(variant => ({
            product_id: productData.id,
            color: variant.color,
            size: variant.size,
            stock_quantity: variant.stock,
            created_at: timestamp,
            updated_at: timestamp,
          }));

          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantPayload);

          if (variantError) {
            console.warn('[useProductMutations] Failed to update variants:', variantError);
          }
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] });

      return mapToProduct(data, {
        category: productData.category,
        categoryId: productData.categoryId,
        variants: productData.variants,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred while updating product';
      console.error('[useProductMutations] Update product error:', err);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useProductMutations] Deleting product:', productId);

      await supabase.from('product_variants').delete().eq('product_id', productId);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('[useProductMutations] Product deletion error:', error);
        throw new Error(`Failed to delete product: ${error.message}`);
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred while deleting product';
      console.error('[useProductMutations] Delete product error:', err);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
