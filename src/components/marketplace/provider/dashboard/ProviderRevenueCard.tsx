import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { useProviderRevenue } from '@/hooks/marketplace/provider/useProviderRevenue';
import { formatRevenue } from '@/lib/provider-utils';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface ProviderRevenueCardProps {
  providerId: string;
  className?: string;
}

export const ProviderRevenueCard: React.FC<ProviderRevenueCardProps> = ({ providerId, className }) => {
  const { data: revenue, isLoading } = useProviderRevenue(providerId);
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (!revenue) return null;
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue Overview</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/marketplace/revenue">
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Earnings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Total Earnings</span>
            </div>
            <p className="text-2xl font-bold">{formatRevenue(revenue.totalRevenue)}</p>
          </div>
          
          {/* This Month */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>This Month</span>
            </div>
            <p className="text-2xl font-bold">{formatRevenue(revenue.currentMonthRevenue)}</p>
            {revenue.monthChange !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${revenue.monthChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {revenue.monthChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(revenue.monthChange).toFixed(1)}% vs last month</span>
              </div>
            )}
          </div>
          
          {/* Pending Payouts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Pending Payouts</span>
            </div>
            <p className="text-2xl font-bold">{formatRevenue(revenue.pendingPayouts)}</p>
          </div>
          
          {/* Avg Booking Value */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Avg Booking Value</span>
            </div>
            <p className="text-2xl font-bold">{formatRevenue(revenue.avgBookingValue)}</p>
          </div>
        </div>
        
        {/* Top Services by Revenue */}
        {revenue.topServices.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Top Services by Revenue</h4>
            <div className="space-y-2">
              {revenue.topServices.map((service, index) => {
                const maxRevenue = revenue.topServices[0].revenue;
                const percentage = maxRevenue > 0 ? (service.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate flex-1">{service.name}</span>
                      <span className="font-medium">{formatRevenue(service.revenue)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{service.count} bookings</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
