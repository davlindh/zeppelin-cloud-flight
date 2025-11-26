import { useState } from 'react';
import { useCart } from '@/contexts/marketplace/CartContext';
import { useCreateOrder } from './useCreateOrder';
import { useMarketplaceCheckout } from './useMarketplaceCheckout';
import { useToast } from '@/hooks/use-toast';
import type { ShippingInfo, PaymentInfo } from '@/pages/marketplace/CheckoutPage';
import type { CartItem } from '@/types/marketplace/cart';

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
  const { createCheckout } = useMarketplaceCheckout();
  const { toast } = useToast();

  const placeOrder = async (checkoutData: CheckoutData): Promise<boolean> => {
    setIsPlacing(true);
    try {
      // Separate product and ticket items
      const productItems = checkoutData.items.filter(item => item.kind === 'product');
      
      // Map product items to order items format
      const productOrderItems = productItems.map(item => ({
        type: 'product' as const,
        id: item.productId,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.price,
        metadata: {
          variants: item.selectedVariants,
          image: item.image,
        },
      }));

      // Map ticket items to order items format (as products for now)
      const ticketOrderItems = ticketItems.map(item => ({
        type: 'product' as const, // Using 'product' type until OrderItem supports 'event_ticket'
        id: item.ticketTypeId,
        title: `${item.eventTitle} - ${item.title}`,
        quantity: item.quantity,
        unitPrice: item.price,
        metadata: {
          variants: { type: 'ticket' },
          image: item.image,
          eventId: item.eventId,
          eventTitle: item.eventTitle,
          eventDate: item.eventDate,
        },
      }));

      // Combine both types of items
      const orderItems = [...productOrderItems, ...ticketOrderItems];

      // Create shipping address object
      const shippingAddress = {
        name: checkoutData.shippingInfo.name,
        address: checkoutData.shippingInfo.address,
        city: checkoutData.shippingInfo.city,
        postalCode: checkoutData.shippingInfo.postalCode,
        country: checkoutData.shippingInfo.country,
        phone: checkoutData.shippingInfo.phone,
      };

      // Create order in pending state
      const orderResult = await createOrder({
      // Create order with all items (products and tickets)
      await createOrder({
        customerEmail: checkoutData.shippingInfo.email,
        customerName: checkoutData.shippingInfo.name,
        customerPhone: checkoutData.shippingInfo.phone,
        subtotal: checkoutData.subtotal,
        taxAmount: checkoutData.taxAmount,
        shippingAmount: checkoutData.shippingAmount,
        totalAmount: checkoutData.totalAmount,
        shippingAddress,
        billingAddress: shippingAddress,
        items: orderItems,
      });

      // Clear cart after order creation
      clearCart();

      // Redirect to Stripe checkout
      await createCheckout({ orderId: orderResult.id });

      return true;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Fel vid beställning',
        description: 'Kunde inte genomföra beställningen. Försök igen.',
        variant: 'destructive',
      });
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
