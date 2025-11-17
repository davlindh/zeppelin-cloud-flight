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
  categoryId?: string; // Add categoryId support
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
  stockQuantity?: number;        // NEW: Direct stock support
  eventId?: string;              // NEW: Link to event
  productType?: string;          // NEW: Mark as 'event_ticket'
  projectId?: string;            // NEW: For future use
  sellerId?: string;             // NEW: For seller tracking
  sellerType?: string;           // NEW: 'admin' | 'provider'
}

interface UpdateProductData extends CreateProductData {
  id: string;
}

export const useProductMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createProduct = async (productData: CreateProductData): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate total stock from variants or use direct stockQuantity
      const totalStock = productData.stockQuantity ?? 
        productData.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0;
      
      // Prepare data for database using correct field names
      const dbData = {
        title: productData.title,
        description: productData.description,
        selling_price: productData.price,
        original_price: productData.originalPrice,
        category_id: productData.categoryId || null, // Use category_id for foreign key
        product_brand: productData.brand,
        features: productData.features ?? [],
        tags: productData.tags ?? [],
        images: Array.isArray(productData.images) ? productData.images : [],
        image: productData.image || productData.images?.[0] || null,
        stock_quantity: totalStock,
        in_stock: totalStock > 0,
        // ✅ NEW FIELDS for event tickets
        event_id: productData.eventId || null,
        product_type: productData.productType || null,
        project_id: productData.projectId || null,
        seller_id: productData.sellerId || null,
        seller_type: productData.sellerType || 'admin',
        rating: 0,
        reviews: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Creating product with data:', dbData);
      console.log('📸 Image data being saved:', {
        image: dbData.image,
        images: dbData.images,
        images_count: dbData.images.length
      });

      const { data, error } = await supabase
        .from('products')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('❌ Product creation error:', error);
        throw new Error(`Failed to create product: ${error.message}`);
      }

      console.log('✅ Product created successfully:', data);

      // Create variants if provided (only with actual attributes)
      if (productData.variants && productData.variants.length > 0) {
        // Filter out variants without actual attributes
        const validVariants = productData.variants.filter(v => 
          v.color || v.size
        );
        
        if (validVariants.length > 0) {
          const variantData = validVariants.map(variant => ({
            product_id: data.id,
            color: variant.color || null,
            size: variant.size || null,
            stock_quantity: variant.stock,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantData);

          if (variantError) {
            console.warn('⚠️ Failed to create variants:', variantError);
          }
        }
      }

      // Invalidate products query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      // Also invalidate event-tickets queries if this is an event ticket
      if (productData.eventId && productData.productType === 'event_ticket') {
        await queryClient.invalidateQueries({ 
          queryKey: ['event-tickets', productData.eventId] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['ticket-sales-stats', productData.eventId] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['event-tickets-overview'] 
        });
      }

      // Transform database response to Product type
      const product: Product = {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.selling_price,
        originalPrice: data.original_price ?? undefined,
        categoryId: productData.categoryId || data.category_id || '',
        categoryName: productData.category || 'General',
        brand: data.product_brand ?? '',
        features: data.features ?? [],
        tags: data.tags ?? [],
        variants: productData.variants ?? [],
        images: data.images ?? [],
        image: data.image ?? '',
        inStock: data.in_stock ?? false,
        rating: data.rating ?? 0,
        reviews: data.reviews ?? 0
      };

      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Create product error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (productData: UpdateProductData): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate total stock from variants
      const totalStock = productData.variants?.reduce((sum, variant) => sum + variant.stock, 0) ?? 0;
      
      // Prepare data for database using correct field names
      const dbData = {
        title: productData.title,
        description: productData.description,
        selling_price: productData.price,
        original_price: productData.originalPrice,
        category_id: productData.categoryId || null, // Use category_id for foreign key
        product_brand: productData.brand,
        features: productData.features ?? [],
        tags: productData.tags ?? [],
        images: Array.isArray(productData.images) ? productData.images : [],
        image: productData.image || productData.images?.[0] || null,
        stock_quantity: totalStock,
        in_stock: totalStock > 0,
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Updating product:', productData.id, 'with data:', dbData);
      console.log('📸 Image data being saved:', {
        image: dbData.image,
        images: dbData.images,
        images_count: dbData.images.length
      });

      const { data, error } = await supabase
        .from('products')
        .update(dbData)
        .eq('id', productData.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Product update error:', error);
        throw new Error(`Failed to update product: ${error.message}`);
      }

      if (!data) {
        throw new Error('Product not found or update failed');
      }

      console.log('✅ Product updated successfully:', data);

      // Update variants - delete existing and recreate
      if (productData.variants) {
        // Delete existing variants
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productData.id);

        // Create new variants if provided
        if (productData.variants.length > 0) {
          const variantData = productData.variants.map(variant => ({
            product_id: productData.id,
            color: variant.color,
            size: variant.size,
            stock_quantity: variant.stock,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantData);

          if (variantError) {
            console.warn('⚠️ Failed to update variants:', variantError);
          }
        }
      }

      // Invalidate products query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      // Transform database response to Product type
      const product: Product = {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.selling_price,
        originalPrice: data.original_price ?? undefined,
        categoryId: productData.categoryId || data.category_id || '',
        categoryName: productData.category || 'General',
        brand: data.product_brand ?? '',
        features: data.features ?? [],
        tags: data.tags ?? [],
        variants: productData.variants ?? [],
        images: data.images ?? [],
        image: data.image ?? '',
        inStock: data.in_stock ?? false,
        rating: data.rating ?? 0,
        reviews: data.reviews ?? 0
      };

      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Update product error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Deleting product:', productId);

      // Delete variants first (due to CASCADE this might not be necessary, but being explicit)
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId);

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('❌ Product deletion error:', error);
        throw new Error(`Failed to delete product: ${error.message}`);
      }

      console.log('✅ Product deleted successfully:', productId);

      // Invalidate products query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Delete product error:', errorMessage);
      setError(errorMessage);
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
    clearError: () => setError(null)
  };
};
