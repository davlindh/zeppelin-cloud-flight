import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Package, Truck, Calendar, User, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateOrderStatus } from "@/hooks/marketplace/useUpdateOrderStatus";
import { useState } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [carrier, setCarrier] = useState("");
  const [status, setStatus] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*,
            products (title, image),
            auctions (title, image),
            services (title)
          ),
          order_status_history (*)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 1000, // Fresh for 10 seconds
  });

  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = () => {
    updateStatus.mutate({
      orderId: orderId!,
      status: status as any,
      notes,
      trackingNumber,
      trackingUrl,
      carrier,
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-8">Order not found</div>;
  }

  const statusColors = {
    pending: 'bg-yellow-500',
    paid: 'bg-green-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-600',
    cancelled: 'bg-red-500',
    refunded: 'bg-gray-500',
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order {order.order_number}</h1>
          <p className="text-muted-foreground">
            {format(new Date(order.created_at), 'PPP p')}
          </p>
        </div>
        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {order.customer_email}
              </p>
            </div>
            {order.customer_phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {order.customer_phone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeof order.shipping_address === 'object' && order.shipping_address && (
              <div className="space-y-1">
                <p>{(order.shipping_address as any).street}</p>
                <p>{(order.shipping_address as any).city}, {(order.shipping_address as any).zip}</p>
                <p>{(order.shipping_address as any).country}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(order.shipping_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Update Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Carrier</Label>
              <Input
                placeholder="e.g., DHL, UPS"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Tracking Number</Label>
              <Input
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div>
              <Label>Tracking URL</Label>
              <Input
                placeholder="Enter tracking URL"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Admin Notes</Label>
            <Textarea
              placeholder="Add notes about this order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleUpdateStatus} disabled={!status}>
            Update Order
          </Button>
        </CardContent>
      </Card>

      {order.order_status_history && order.order_status_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Status History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_status_history.map((history: any) => (
                <div key={history.id} className="flex items-start gap-3 p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">
                      {history.old_status} → {history.new_status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(history.created_at), 'PPP p')}
                    </p>
                    {history.notes && (
                      <p className="text-sm mt-1">{history.notes}</p>
                    )}
                  </div>
                  <Badge variant="outline">{history.changed_by_type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
