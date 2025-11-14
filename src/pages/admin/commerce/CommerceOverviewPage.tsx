import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingCart, TrendingUp, Users, Settings } from 'lucide-react';

export const CommerceOverviewPage = () => {
  const { data: stats } = useQuery({
    queryKey: ['commerce-overview-stats'],
    queryFn: async () => {
      const [productsRes, ordersRes, sellersRes] = await Promise.all([
        supabase.from('products').select('id, approval_status'),
        supabase.from('orders').select('id, total_amount, total_commission, status'),
        supabase
          .from('products')
          .select('seller_id')
          .not('seller_id', 'is', null),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];
      const sellerIds = new Set(sellersRes.data?.map((p) => p.seller_id) || []);

      const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
      const totalCommission = orders.reduce((sum, o) => sum + (o.total_commission || 0), 0);
      const pendingProducts = products.filter((p) => p.approval_status === 'pending').length;

      return {
        totalProducts: products.length,
        pendingProducts,
        totalOrders: orders.length,
        totalRevenue,
        totalCommission,
        totalSellers: sellerIds.size,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commerce Overview</h1>
          <p className="text-muted-foreground">Unified marketplace management dashboard</p>
        </div>
        <Link to="/admin/settings/commissions">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Commission Settings
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingProducts || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSellers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRevenue.toFixed(2) || 0} kr
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCommission.toFixed(2) || 0} kr
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRevenue
                ? ((stats.totalCommission / stats.totalRevenue) * 100).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/products">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <Package className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage and approve products</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/orders">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <ShoppingCart className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Orders</CardTitle>
              <CardDescription>View and manage orders</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/commerce/sellers">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Sellers</CardTitle>
              <CardDescription>Seller performance metrics</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/commerce/events">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>Commerce by event</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
};
