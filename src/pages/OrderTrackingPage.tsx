import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { format } from "date-fns";

export default function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [hasSearched, setHasSearched] = useState(!!searchParams.get('order'));

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['track-order', orderNumber, email],
    queryFn: async () => {
      if (!orderNumber || !email) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (title, image),
            auctions (title, image),
            services (title)
          ),
          order_status_history (*)
        `)
        .eq('order_number', orderNumber)
        .eq('customer_email', email)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: hasSearched && !!orderNumber && !!email,
    staleTime: 30 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setSearchParams({ order: orderNumber, email });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                placeholder="e.g., ORD-2025-0001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Track Order
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Searching for your order...</p>
          </CardContent>
        </Card>
      )}

      {error && hasSearched && (
        <Card>
          <CardContent className="py-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Order not found. Please check your order number and email address.
            </p>
          </CardContent>
        </Card>
      )}

      {order && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order #{order.order_number}</span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ordered on</p>
                  <p className="font-medium">{format(new Date(order.created_at), 'PPP p')}</p>
                </div>

                {order.tracking_number && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-medium font-mono">{order.tracking_number}</p>
                    {order.carrier && (
                      <p className="text-sm text-muted-foreground">Carrier: {order.carrier}</p>
                    )}
                    {order.tracking_url && (
                      <Button asChild variant="link" className="px-0">
                        <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                          Track on carrier website →
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.item_title}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} • ${item.unit_price} each
                          </p>
                        </div>
                        <p className="font-bold">${item.total_price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.order_status_history && order.order_status_history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_status_history
                    .sort((a: any, b: any) => 
                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )
                    .map((history: any, index: number) => (
                      <div key={history.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background">
                            {getStatusIcon(history.new_status)}
                          </div>
                          {index < order.order_status_history.length - 1 && (
                            <div className="w-0.5 h-12 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium capitalize">
                            {history.new_status.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(history.created_at), 'PPP p')}
                          </p>
                          {history.notes && (
                            <p className="text-sm mt-1">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
