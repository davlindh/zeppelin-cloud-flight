import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export const EventCommerceAnalytics = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const { data: events = [] } = useQuery({
    queryKey: ['events-for-commerce'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .eq('status', 'published')
        .order('starts_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['event-commerce-stats', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return null;

      // Get products for this event
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, seller_id')
        .eq('event_id', selectedEventId);

      if (productsError) throw productsError;

      // Get orders for this event
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, total_commission, created_at')
        .eq('event_id', selectedEventId);

      if (ordersError) throw ordersError;

      // Get order items for revenue calculation
      const productIds = products?.map((p) => p.id) || [];
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('item_id, seller_id, total_price, commission_amount, quantity')
        .in('item_id', productIds);

      if (itemsError) throw itemsError;

      const totalRevenue = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
      const totalCommission = orders?.reduce((sum, o) => sum + (o.total_commission || 0), 0) || 0;

      return {
        productCount: products?.length || 0,
        orderCount: orders?.length || 0,
        totalRevenue,
        totalCommission,
        products: products || [],
        orderItems: orderItems || [],
      };
    },
    enabled: !!selectedEventId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Commerce Analytics</h1>
        <p className="text-muted-foreground">View sales and revenue per event</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Choose an event..." />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
      </Card>

      {stats && !isLoading && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.productCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orderCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} kr</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Commission</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCommission.toFixed(2)} kr</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Products</CardTitle>
              <CardDescription>Products linked to this event</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.products.map((product) => {
                    const productItems = stats.orderItems.filter((i) => i.item_id === product.id);
                    const sold = productItems.reduce((sum, i) => sum + i.quantity, 0);
                    const revenue = productItems.reduce((sum, i) => sum + i.total_price, 0);

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{sold}</TableCell>
                        <TableCell className="font-bold">{revenue.toFixed(2)} kr</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
