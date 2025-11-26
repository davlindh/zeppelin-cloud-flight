import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface PaymentStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  pendingOrders: number;
  refundAmount: number;
  averageOrderValue: number;
  paymentMethodBreakdown: Record<string, number>;
}

export const AdminPaymentDashboard = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Fetch real order data with analytics
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-payment-analytics', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('payment_status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Calculate analytics from real data
  const stats: PaymentStats = orders.length > 0 ? {
    totalRevenue: orders
      .filter(order => order.payment_status === 'paid' || order.status === 'delivered')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0),
    totalOrders: orders.length,
    completedOrders: orders.filter(order => 
      order.payment_status === 'paid' || order.status === 'delivered'
    ).length,
    failedOrders: orders.filter(order => order.payment_status === 'failed').length,
    pendingOrders: orders.filter(order => 
      order.payment_status === 'pending' || order.status === 'pending'
    ).length,
    refundAmount: orders.filter(order => order.status === 'refunded')
      .reduce((sum, order) => sum + (order.total_amount || 0), 0),
    averageOrderValue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length,
    paymentMethodBreakdown: orders.reduce((acc, order) => {
      const method = order.payment_method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  } : {
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    failedOrders: 0,
    pendingOrders: 0,
    refundAmount: 0,
    averageOrderValue: 0,
    paymentMethodBreakdown: {},
  };

  const handleManualConfirmation = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment manually confirmed',
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to confirm payment',
      });
    }
  };

  const handleRefund = async (orderId: string, amount?: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Refund processed successfully',
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process refund',
      });
    }
  };

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Dashboard</h1>
          <p className="text-muted-foreground">
            Manage orders, payments, and analytics ({orders.length} orders)
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.reload()} 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toLocaleString('sv-SE')} SEK
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOrders > 0 
                ? Math.round((stats.completedOrders / stats.totalOrders) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageOrderValue.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} SEK
            </div>
            <p className="text-xs text-muted-foreground">
              Per order value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.failedOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      {Object.keys(stats.paymentMethodBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.paymentMethodBreakdown).map(([method, count]) => (
                <div key={method} className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground capitalize">{method}</p>
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalOrders > 0 ? Math.round((count / stats.totalOrders) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Order Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Payment Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ml-2 px-3 py-1 border rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table - Using existing component */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Orders ({orders.length})</h2>
        <OrdersTable />
      </div>
    </div>
  );
};
