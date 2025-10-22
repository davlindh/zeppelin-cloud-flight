import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Truck, Calendar, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency";

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-confirmation', orderNumber],
    queryFn: async () => {
      if (!orderNumber) throw new Error('No order number provided');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (title, image),
            auctions (title, image),
            services (title)
          )
        `)
        .eq('order_number', orderNumber)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!orderNumber,
    staleTime: 60 * 1000, // 1 minute
  });

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  if (!orderNumber) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No order information found</p>
            <Button asChild className="mt-4">
              <Link to="/marketplace/shop">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="text-center py-8">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Order not found</p>
            <Button asChild className="mt-4">
              <Link to="/marketplace/shop">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.created_at);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We've sent a confirmation email to{" "}
          <span className="font-medium">{order.customer_email}</span>
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order #{order.order_number}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {format(new Date(order.created_at), 'PPP')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Order Status</p>
                <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Estimated Delivery</p>
                <p className="text-sm text-muted-foreground">
                  {format(estimatedDelivery, 'PPP')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Shipping To</p>
                <p className="text-sm text-muted-foreground">
                  {typeof order.shipping_address === 'object' && order.shipping_address
                    ? `${(order.shipping_address as any).city}, ${(order.shipping_address as any).country}`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="font-semibold">Order Items</h3>
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.item_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.item_type} • Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(item.total_price)}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(item.unit_price)} each</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCurrency(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{formatCurrency(order.shipping_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        <Button asChild variant="outline">
          <Link to={`/order-tracking?order=${order.order_number}&email=${order.customer_email}`}>
            <Truck className="mr-2 h-4 w-4" />
            Track Order
          </Link>
        </Button>
        <Button asChild>
          <Link to="/marketplace/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
