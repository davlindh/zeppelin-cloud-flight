import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign } from 'lucide-react';
import { useCustomerInsights } from '@/hooks/marketplace/provider/useCustomerInsights';
import { formatRevenue } from '@/lib/provider-utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerInsightsProps {
  providerId: string;
}

export const CustomerInsights: React.FC<CustomerInsightsProps> = ({ providerId }) => {
  const { data: insights, isLoading } = useCustomerInsights(providerId);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!insights) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold">{insights.totalCustomers}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Repeat Rate</p>
            <p className="text-2xl font-bold">{insights.repeatRate}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg CLV</p>
            <p className="text-2xl font-bold">{formatRevenue(insights.avgLifetimeValue)}</p>
          </div>
        </div>
        
        {/* Top Customers */}
        {insights.topCustomers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Top Customers</h4>
            <div className="space-y-2">
              {insights.topCustomers.map((customer, index) => (
                <div key={customer.email} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.bookingCount} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatRevenue(customer.totalSpent)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* New vs Returning (Last 30 Days) */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Activity (Last 30 Days)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">New Customers</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {insights.newCustomers}
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Returning</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {insights.returningCustomers}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
