import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/marketplace/CartContext';
import { useCreateOrder } from './useCreateOrder';
import type { ShippingInfo, PaymentInfo } from '@/pages/marketplace/CheckoutPage';
import type { CartItem } from '@/types/cart';

interface CheckoutData {
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
}

export const useCheckout = () => {
  const [isPlacing, setIsPlacing] = useState(false);
  const { clearCart } = useCart();
  const { mutateAsync: createOrder } = useCreateOrder();

  const placeOrder = async (checkoutData: CheckoutData): Promise<boolean> => {
    setIsPlacing(true);
    try {
      // Map cart items to order items format
      const orderItems = checkoutData.items.map(item => ({
        type: 'product' as const,
        id: item.productId || item.id,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.price,
        variantId: item.selectedVariants ? undefined : undefined,
        metadata: {
          variants: item.selectedVariants,
          image: item.image,
        },
      }));

      // Create shipping address object
      const shippingAddress = {
        name: checkoutData.shippingInfo.name,
        address: checkoutData.shippingInfo.address,
        city: checkoutData.shippingInfo.city,
        postalCode: checkoutData.shippingInfo.postalCode,
        country: checkoutData.shippingInfo.country,
        phone: checkoutData.shippingInfo.phone,
      };

      // Create order
      await createOrder({
        customerEmail: checkoutData.shippingInfo.email,
        customerName: checkoutData.shippingInfo.name,
        customerPhone: checkoutData.shippingInfo.phone,
        subtotal: checkoutData.subtotal,
        taxAmount: checkoutData.taxAmount,
        shippingAmount: checkoutData.shippingAmount,
        totalAmount: checkoutData.totalAmount,
        shippingAddress,
        billingAddress: shippingAddress, // Use same address for billing
        items: orderItems,
      });

      // Clear cart after successful order
      clearCart();

      return true;
    } catch (error) {
      console.error('Checkout error:', error);
      return false;
    } finally {
      setIsPlacing(false);
    }
  };

  return {
    placeOrder,
    isPlacing,
  };
};
