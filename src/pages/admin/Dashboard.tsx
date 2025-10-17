import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Gavel, Wrench } from 'lucide-react';
import { SecurityMetricsCard } from '@/components/admin/dashboard/SecurityMetricsCard';
import { LiveActivityFeed } from '@/components/admin/dashboard/LiveActivityFeed';
import { AlertsCenter } from '@/components/admin/dashboard/AlertsCenter';
import AdminDataHub from '@/components/admin/dashboard/AdminDataHub';
import { useDashboardStats, useRevenueStats } from '@/hooks/useDashboardStats';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { ZeppelStatsCards } from '@/components/admin/ZeppelStatsCards';

export const Dashboard = () => {
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueStats } = useRevenueStats();
  const { logAdminAction } = useAdminAuditLog();

  const securityStatus: 'secure' | 'warning' | 'critical' = (() => {
    const lowStock = dashboardStats?.products.lowStock ?? 0;
    const endingToday = dashboardStats?.auctions.endingToday ?? 0;
    
    if (lowStock > 10 || endingToday > 5) return 'critical';
    if (lowStock > 0 || endingToday > 0) return 'warning';
    return 'secure';
  })();

  const handleSecurityClick = () => {
    logAdminAction({
      action: 'view_security_dashboard',
      details: { timestamp: new Date().toISOString() }
    });
  };

  const handleActivityViewAll = () => {
    logAdminAction({
      action: 'view_activity_log',
      details: { timestamp: new Date().toISOString() }
    });
  };

  const handleAlertAction = (alertId: string, action: string) => {
    logAdminAction({
      action: `alert_${action}`,
      details: { alertId, action, timestamp: new Date().toISOString() }
    });
  };

  if (statsLoading) {
    return <div className="flex items-center justify-center h-96">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Zeppel Admin Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Zeppel Admin</h2>
        <ZeppelStatsCards />
      </div>

      {/* Marketplace Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Marketplace Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueStats?.today.toLocaleString() ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              +{revenueStats?.growth ?? 0}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.products.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.products.lowStock ?? 0} low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.auctions.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.auctions.endingToday ?? 0} ending today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.services.total ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.services.active ?? 0} active
            </p>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Security & Activity Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <SecurityMetricsCard 
          onViewDetails={handleSecurityClick}
        />
        <LiveActivityFeed 
          onViewAll={handleActivityViewAll}
        />
      </div>

      {/* Alerts & Data Hub */}
      <div className="grid gap-4 md:grid-cols-2">
        <AlertsCenter onAlertAction={handleAlertAction} />
        <AdminDataHub />
      </div>
    </div>
  );
};
