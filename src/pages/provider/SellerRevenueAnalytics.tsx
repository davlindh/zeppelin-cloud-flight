import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSellerRevenue } from '@/hooks/marketplace/useSellerRevenue';
import { DollarSign, TrendingUp, Package, Calendar } from 'lucide-react';

export const SellerRevenueAnalytics = () => {
  const { data: revenue, isLoading } = useSellerRevenue();

  if (isLoading || !revenue) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue Analytics</h1>
        <p className="text-muted-foreground">Track your sales performance and earnings</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue.totalRevenue.toFixed(2)} kr</div>
            <p className="text-xs text-muted-foreground">
              From {revenue.orderCount} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -{revenue.totalCommission.toFixed(2)} kr
            </div>
            <p className="text-xs text-muted-foreground">
              Commission paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {revenue.netPayout.toFixed(2)} kr
            </div>
            <p className="text-xs text-muted-foreground">
              Your earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue.itemsSold}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {revenue.averageOrderValue.toFixed(2)} kr
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Best performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenue.topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-semibold">{product.productTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.itemsSold} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{product.revenue.toFixed(2)} kr</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Event */}
      {revenue.revenueByEvent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Event</CardTitle>
            <CardDescription>Sales breakdown per event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenue.revenueByEvent.map((event) => (
                <div key={event.eventId} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{event.eventTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.orderCount} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{event.revenue.toFixed(2)} kr</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout Status */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Status</CardTitle>
          <CardDescription>Pending and completed payouts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between p-4 border rounded">
              <div>
                <p className="font-semibold">Pending Payout</p>
                <p className="text-sm text-muted-foreground">Orders in progress</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-warning">
                  {revenue.pendingPayout.toFixed(2)} kr
                </p>
              </div>
            </div>
            <div className="flex justify-between p-4 border rounded">
              <div>
                <p className="font-semibold">Completed Payouts</p>
                <p className="text-sm text-muted-foreground">Delivered orders</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {revenue.paidOut.toFixed(2)} kr
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
