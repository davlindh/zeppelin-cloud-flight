import { useState } from 'react';
import { Plus, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useMyProducts } from '@/hooks/marketplace/useMyProducts';
import { ProductCreationWizard } from '@/components/provider/ProductCreationWizard';
import { ProductSalesMetrics } from '@/components/provider/ProductSalesMetrics';

export const MyProductsPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  const { data: allProducts = [], isLoading } = useMyProducts();
  const { data: approvedProducts = [] } = useMyProducts({ approvalStatus: 'approved' });
  const { data: pendingProducts = [] } = useMyProducts({ approvalStatus: 'pending' });
  const { data: rejectedProducts = [] } = useMyProducts({ approvalStatus: 'rejected' });

  const stats = {
    total: allProducts.length,
    approved: approvedProducts.length,
    pending: pendingProducts.length,
    inStock: allProducts.filter(p => p.inStock).length,
    lowStock: allProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Products</h1>
          <p className="text-muted-foreground">Manage your product listings and inventory</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approved} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground">
              Available for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Product Listings</CardTitle>
          <CardDescription>View and manage your products by status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              {stats.pending > 0 && (
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="all">
              <ProductSalesMetrics products={allProducts} />
            </TabsContent>

            <TabsContent value="approved">
              <ProductSalesMetrics products={approvedProducts} />
            </TabsContent>

            <TabsContent value="pending">
              <ProductSalesMetrics products={pendingProducts} />
            </TabsContent>

            <TabsContent value="rejected">
              <ProductSalesMetrics products={rejectedProducts} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Creation Wizard */}
      <ProductCreationWizard
        open={isCreating}
        onClose={() => setIsCreating(false)}
      />
    </div>
  );
};
