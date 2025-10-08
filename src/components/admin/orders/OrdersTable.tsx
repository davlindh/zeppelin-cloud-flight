import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Eye, Mail, Phone, Package, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseOrder {
  id: string;
  order_number: string;
  item_title: string;
  item_type: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  tax_amount: number;
  shipping_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  billing_address: any;
  notes?: string;
  user_id?: string;
  users?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
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
  const [selectedOrder, setSelectedOrder] = useState<DatabaseOrder | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async (): Promise<DatabaseOrder[]> => {
      console.log('Fetching all orders for admin');
      
      try {
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select(`
            *,
            users (
              full_name,
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          throw error;
        }

        console.log('Fetched orders from database:', ordersData);
        return (ordersData ?? []) as DatabaseOrder[];
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  const handleViewDetails = (order: DatabaseOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
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
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
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
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {order.users?.full_name || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.users?.email || 'No email'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.item_title}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {order.quantity}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.item_type}</Badge>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEmailCustomer(order.users?.email)}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Email Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCallCustomer(order.users?.phone)}
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
                      <p>{selectedOrder.users?.full_name || 'Unknown Customer'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Email</p>
                      <p>{selectedOrder.users?.email || 'No email provided'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Phone</p>
                      <p>{selectedOrder.users?.phone || 'No phone provided'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Customer ID</p>
                      <p>{selectedOrder.user_id || 'Guest'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleEmailCustomer(selectedOrder.users?.email)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email Customer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCallCustomer(selectedOrder.users?.phone)}
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
                      <p>{selectedOrder.item_title}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Item Type</p>
                      <Badge variant="outline">{selectedOrder.item_type}</Badge>
                    </div>
                    <div>
                      <p className="font-semibold">Quantity</p>
                      <p>{selectedOrder.quantity}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Unit Price</p>
                      <p>${selectedOrder.unit_price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Pricing Breakdown */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Pricing Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal ({selectedOrder.quantity} × ${selectedOrder.unit_price.toFixed(2)})</span>
                        <span>${(selectedOrder.quantity * selectedOrder.unit_price).toFixed(2)}</span>
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

                  {selectedOrder.notes && (
                    <div>
                      <p className="font-semibold">Notes</p>
                      <p className="text-sm bg-muted p-2 rounded">
                        {selectedOrder.notes}
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