import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Eye, Mail, Phone, Package, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  tax_amount: number;
  shipping_amount: number;
  status: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  billing_address?: any;
  customer_notes?: string;
  admin_notes?: string;
  tracking_number?: string;
  user_id?: string;
  order_items?: Array<{
    id: string;
    item_title: string;
    item_type: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'secondary';
    case 'processing':
      return 'default';
    case 'shipped':
      return 'outline';
    case 'delivered':
      return 'default';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function OrdersTable() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<DatabaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: async (): Promise<DatabaseOrder[]> => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            item_title,
            item_type,
            quantity,
            unit_price,
            total_price
          )
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter) {
        query = query.eq('status', statusFilter as any);
      }
      
      const { data: ordersData, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return (ordersData ?? []) as DatabaseOrder[];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.customer_email.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleEmailCustomer = (email?: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    }
  };

  const handleCallCustomer = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
          <p className="text-muted-foreground">
            No orders have been placed yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by order number, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.order_items?.[0]?.item_title || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {order.order_items?.[0]?.quantity || 0}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.order_items?.[0]?.item_type || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEmailCustomer(order.customer_email)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Email Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCallCustomer(order.customer_phone)}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.order_number}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Name</p>
                      <p>{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Email</p>
                      <p>{selectedOrder.customer_email}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p>{selectedOrder.customer_phone || 'No phone provided'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Customer ID</p>
                      <p>{selectedOrder.user_id || 'Guest'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEmailCustomer(selectedOrder.customer_email)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email Customer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCallCustomer(selectedOrder.customer_phone)}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call Customer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Order Number</p>
                      <p>{selectedOrder.order_number}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status</p>
                      <Badge variant={getStatusVariant(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-semibold">Item Title</p>
                      <p>{selectedOrder.order_items?.[0]?.item_title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Item Type</p>
                      <Badge variant="outline">{selectedOrder.order_items?.[0]?.item_type || 'N/A'}</Badge>
                    </div>
                    <div>
                      <p className="font-semibold">Quantity</p>
                      <p>{selectedOrder.order_items?.[0]?.quantity || 0}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Unit Price</p>
                      <p>${selectedOrder.order_items?.[0]?.unit_price?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  
                  {/* Pricing Breakdown */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Pricing Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${(selectedOrder.order_items?.[0]?.total_price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${selectedOrder.tax_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>${selectedOrder.shipping_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total</span>
                        <span>${selectedOrder.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.customer_notes && (
                    <div>
                      <p className="font-semibold">Customer Notes</p>
                      <p className="text-sm bg-muted p-2 rounded">
                        {selectedOrder.customer_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Addresses */}
              {(selectedOrder.shipping_address || selectedOrder.billing_address) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Addresses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOrder.shipping_address && (
                        <div>
                          <h4 className="font-semibold mb-2">Shipping Address</h4>
                          <div className="text-sm space-y-1">
                            <p>{selectedOrder.shipping_address.street}</p>
                            <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</p>
                            <p>{selectedOrder.shipping_address.country}</p>
                          </div>
                        </div>
                      )}
                      {selectedOrder.billing_address && (
                        <div>
                          <h4 className="font-semibold mb-2">Billing Address</h4>
                          <div className="text-sm space-y-1">
                            <p>{selectedOrder.billing_address.street}</p>
                            <p>{selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} {selectedOrder.billing_address.zip}</p>
                            <p>{selectedOrder.billing_address.country}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Order Created</span>
                      <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Updated</span>
                      <span>{new Date(selectedOrder.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}