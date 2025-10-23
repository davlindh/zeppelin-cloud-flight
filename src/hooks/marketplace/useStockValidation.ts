import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { CartItem } from '@/types/cart';

export interface StockValidationError {
  item: CartItem;
  availableStock: number;
  requestedQuantity: number;
}

export interface StockValidationResult {
  isValid: boolean;
  errors: StockValidationError[];
  checksPerformed: number;
}

/**
 * Hook to validate stock availability for cart items before checkout
 * Calls this before allowing order placement to prevent overselling
 */
export const useStockValidation = () => {
  const { handleError } = useErrorHandler();

  const validateStock = async (
    cartItems: CartItem[],
    signal?: AbortSignal
  ): Promise<StockValidationResult> => {
    try {
      if (!cartItems.length) {
        return { isValid: true, errors: [], checksPerformed: 0 };
      }

      // Group items by product ID to check base stock levels
      const productIds = [...new Set(cartItems.map(item => item.productId))];

      // Query products for current stock levels
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock_quantity')
        .in('id', productIds);

      if (productsError) throw productsError;

      // Check each cart item against available stock
      const errors: StockValidationError[] = [];
      let checksPerformed = 0;

      for (const cartItem of cartItems) {
        checksPerformed++;
        const product = products?.find(p => p.id === cartItem.productId);

        if (product) {
          const availableStock = product.stock_quantity || 0;

          // Validate stock (only check product-level stock for now)
          if (cartItem.quantity > availableStock) {
            errors.push({
              item: cartItem,
              availableStock,
              requestedQuantity: cartItem.quantity
            });
          }
        } else {
          // Product not found - this shouldn't happen but let's be safe
          errors.push({
            item: cartItem,
            availableStock: 0,
            requestedQuantity: cartItem.quantity
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        checksPerformed
      };

    } catch (error) {
      console.error('Stock validation error:', error);
      handleError(new Error('Failed to validate stock availability.'));
      return { isValid: false, errors: [], checksPerformed: 0 };
    }
  };

  // Query hook for pre-checkout validation with caching
  const usePreCheckoutValidation = (cartItems: CartItem[], enabled: boolean = true) => {
    return useQuery({
      queryKey: ['stock-validation', cartItems.map(item =>
        `${item.productId}-${JSON.stringify(item.selectedVariants)}-${item.quantity}`
      )],
      queryFn: ({ signal }) => validateStock(cartItems, signal),
      enabled: enabled && cartItems.length > 0,
      staleTime: 30 * 1000, // 30 seconds - stock can change but not too frequently
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: true, // Important for accuracy
    });
  };

  return {
    validateStock,
    usePreCheckoutValidation
  };
};
