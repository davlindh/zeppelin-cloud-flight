import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ShippingInfo, PaymentInfo, CheckoutStep } from '@/pages/marketplace/CheckoutPage';
import type { CartItem } from '@/types/marketplace/cart';
import { Edit2, CreditCard, MapPin, ShoppingBag } from 'lucide-react';

interface OrderReviewProps {
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  onPlaceOrder: () => void;
  isPlacing: boolean;
  onEdit: (step: CheckoutStep) => void;
}

export const OrderReview = ({
  shippingInfo,
  paymentInfo,
  items,
  subtotal,
  taxAmount,
  shippingAmount,
  totalAmount,
  onPlaceOrder,
  isPlacing,
  onEdit,
}: OrderReviewProps) => {
  const getPaymentMethodLabel = () => {
    switch (paymentInfo.method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'klarna':
        return 'Klarna';
      case 'swish':
        return 'Swish';
      default:
        return paymentInfo.method;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Review Your Order</h2>
        <p className="text-muted-foreground mb-6">
          Please review your order details before placing your order
        </p>
      </div>

      {/* Shipping Information */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Shipping Address</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('shipping')}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="text-sm space-y-1">
          <p className="font-medium">{shippingInfo.name}</p>
          <p className="text-muted-foreground">{shippingInfo.address}</p>
          <p className="text-muted-foreground">
            {shippingInfo.postalCode} {shippingInfo.city}
          </p>
          <p className="text-muted-foreground">{shippingInfo.country}</p>
          <p className="text-muted-foreground mt-2">{shippingInfo.email}</p>
          <p className="text-muted-foreground">{shippingInfo.phone}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Payment Method</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('payment')}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{getPaymentMethodLabel()}</p>
        {paymentInfo.method === 'card' && paymentInfo.cardNumber && (
          <p className="text-sm text-muted-foreground">
            •••• {paymentInfo.cardNumber.slice(-4)}
          </p>
        )}
      </div>

      {/* Order Items */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Order Items ({items.length})</h3>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                {item.kind === 'product' && Object.keys(item.selectedVariants).length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {Object.entries(item.selectedVariants)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {(item.price * item.quantity).toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{subtotal.toLocaleString('sv-SE')} kr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shippingAmount.toLocaleString('sv-SE')} kr</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (25%)</span>
            <span>{taxAmount.toLocaleString('sv-SE')} kr</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">
              {totalAmount.toLocaleString('sv-SE')} kr
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={onPlaceOrder}
        disabled={isPlacing}
        className="w-full"
        size="lg"
      >
        {isPlacing ? 'Placing Order...' : 'Place Order'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By placing your order, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};
