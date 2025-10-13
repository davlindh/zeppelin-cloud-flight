import { useProductMutations } from '@/hooks/useProductMutations';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/unified';

export const useProductActions = () => {
  const { createProduct, updateProduct, deleteProduct, error } = useProductMutations();
  const { toast } = useToast();

  const handleCreate = async (productData: Partial<Product>) => {
    try {
      const result = await createProduct({
        title: productData.title!,
        description: productData.description!,
        price: productData.price!,
        originalPrice: productData.originalPrice,
        category: productData.categoryName!,
        brand: productData.brand,
        features: productData.features,
        tags: productData.tags,
        variants: productData.variants,
        images: productData.images,
        image: productData.image ?? undefined
      });
      
      if (result) {
        toast({
          title: "Product created",
          description: `"${result.title}" has been successfully created.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: error ?? "Failed to create product. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Create product error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdate = async (id: string, productData: Partial<Product>) => {
    try {
      const result = await updateProduct({
        id,
        title: productData.title!,
        description: productData.description!,
        price: productData.price!,
        originalPrice: productData.originalPrice,
        category: productData.categoryName!,
        brand: productData.brand,
        features: productData.features,
        tags: productData.tags,
        variants: productData.variants,
        images: productData.images,
        image: productData.image ?? undefined
      });
      
      if (result) {
        toast({
          title: "Product updated",
          description: `"${result.title}" has been successfully updated.`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: error ?? "Failed to update product. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error('Update product error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
      const success = await deleteProduct(product.id);
      
      if (success) {
        toast({
          title: "Product deleted",
          description: `"${product.title}" has been successfully deleted.`,
        });
      } else {
        toast({
          title: "Error",
          description: error ?? "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleView = (product: Product) => {
    // For now, view = edit
    return product;
  };

  return { handleCreate, handleUpdate, handleDelete, handleView };
};
