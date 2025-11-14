import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSellerOrders } from '@/hooks/marketplace/useSellerOrders';
import { format } from 'date-fns';

export const SellerOrdersPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: orders = [], isLoading } = useSellerOrders({
    status: statusFilter as any,
  });

  const filteredOrders = orders.filter(order =>
    order.itemTitle.toLowerCase().includes(search.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    order.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track orders containing your products</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipped}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View all orders containing your products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{order.orderNumber}</span>
                      <Badge>{order.orderStatus}</Badge>
                      {order.eventTitle && (
                        <Badge variant="outline">📅 {order.eventTitle}</Badge>
                      )}
                    </div>
                    <p className="text-sm">{order.itemTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Customer: {order.customerName} ({order.customerEmail})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.orderCreatedAt), 'PPp')}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-bold">{order.totalPrice.toFixed(2)} kr</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {order.quantity}
                    </div>
                    {order.commissionAmount > 0 && (
                      <>
                        <div className="text-xs text-destructive">
                          Commission: -{order.commissionAmount.toFixed(2)} kr
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          Payout: {(order.totalPrice - order.commissionAmount).toFixed(2)} kr
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No orders found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
