import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Package, TrendingUp } from 'lucide-react';

interface SellerStats {
  sellerId: string;
  sellerName: string;
  sellerType: string;
  productCount: number;
  totalRevenue: number;
  totalCommission: number;
  orderCount: number;
}

export const SellerManagement = () => {
  const [search, setSearch] = useState('');

  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      // Get all products with seller info
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, seller_id, seller_type');

      if (productsError) throw productsError;

      // Get order items with revenue data
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('seller_id, total_price, commission_amount, order_id');

      if (orderItemsError) throw orderItemsError;

      // Get seller names from service_providers
      const { data: providers, error: providersError } = await supabase
        .from('service_providers')
        .select('id, name');

      if (providersError) throw providersError;

      // Aggregate stats by seller
      const sellerMap = new Map<string, SellerStats>();

      products?.forEach((product) => {
        if (!product.seller_id) return;

        if (!sellerMap.has(product.seller_id)) {
          const provider = providers?.find((p) => p.id === product.seller_id);
          sellerMap.set(product.seller_id, {
            sellerId: product.seller_id,
            sellerName: provider?.name || 'Unknown',
            sellerType: product.seller_type || 'provider',
            productCount: 0,
            totalRevenue: 0,
            totalCommission: 0,
            orderCount: 0,
          });
        }

        const stats = sellerMap.get(product.seller_id)!;
        stats.productCount++;
      });

      orderItems?.forEach((item) => {
        if (!item.seller_id) return;
        const stats = sellerMap.get(item.seller_id);
        if (stats) {
          stats.totalRevenue += item.total_price;
          stats.totalCommission += item.commission_amount || 0;
          stats.orderCount++;
        }
      });

      return Array.from(sellerMap.values()).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );
    },
  });

  const filteredSellers = sellers.filter((seller) =>
    seller.sellerName.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading seller data...</div>;
  }

  const totalRevenue = sellers.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalCommission = sellers.reduce((sum, s) => sum + s.totalCommission, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Management</h1>
        <p className="text-muted-foreground">Manage sellers and their performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} kr</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommission.toFixed(2)} kr</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sellers</CardTitle>
          <CardDescription>Performance metrics for all sellers</CardDescription>
          <Input
            placeholder="Search sellers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.map((seller) => (
                <TableRow key={seller.sellerId}>
                  <TableCell className="font-medium">{seller.sellerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{seller.sellerType}</Badge>
                  </TableCell>
                  <TableCell>{seller.productCount}</TableCell>
                  <TableCell>{seller.orderCount}</TableCell>
                  <TableCell className="font-bold">{seller.totalRevenue.toFixed(2)} kr</TableCell>
                  <TableCell className="text-muted-foreground">
                    {seller.totalCommission.toFixed(2)} kr
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
