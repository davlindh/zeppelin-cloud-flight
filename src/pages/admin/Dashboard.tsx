import { useState } from 'react';
import { SecurityMetricsCard } from '@/components/admin/dashboard/SecurityMetricsCard';
import { LiveActivityFeed } from '@/components/admin/dashboard/LiveActivityFeed';
import { AlertsCenter } from '@/components/admin/dashboard/AlertsCenter';
import AdminDataHub from '@/components/admin/dashboard/AdminDataHub';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { DashboardHero } from '@/components/admin/dashboard/DashboardHero';
import { QuickActions } from '@/components/admin/dashboard/QuickActions';
import { ZeppelStatsSection } from '@/components/admin/dashboard/ZeppelStatsSection';
import { MarketplaceStatsSection } from '@/components/admin/dashboard/MarketplaceStatsSection';
import { ServicesStatsSection } from '@/components/admin/dashboard/ServicesStatsSection';
import { useUnifiedDashboardStats } from '@/hooks/useUnifiedDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminActionShortcuts } from '@/components/admin/dashboard/AdminActionShortcuts';
import { AdminAnalyticsSection } from '@/components/admin/dashboard/AdminAnalyticsSection';
import { SystemHealthMonitor } from '@/components/admin/dashboard/SystemHealthMonitor';
import { AdminPerformanceCard } from '@/components/admin/dashboard/AdminPerformanceCard';
import { RecentChangesTimeline } from '@/components/admin/dashboard/RecentChangesTimeline';
import { KeyboardShortcutsModal } from '@/components/admin/dashboard/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/admin/useKeyboardShortcuts';

export const Dashboard = () => {
  const { data: stats, isLoading, refetch } = useUnifiedDashboardStats();
  const { logAdminAction } = useAdminAuditLog();
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  useKeyboardShortcuts(true, () => setShowShortcuts(true));

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

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    refetch();
    logAdminAction({
      action: 'refresh_dashboard',
      details: { timestamp: new Date().toISOString() }
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Hero Section */}
        <DashboardHero
          actionItemsCount={stats.action_items.total}
          lastUpdated={stats.last_updated}
          onRefresh={handleRefresh}
          isRefreshing={isLoading}
        />

        {/* Action Shortcuts */}
        <AdminActionShortcuts />

        {/* Quick Actions */}
        {stats.action_items.total > 0 && (
          <QuickActions
            submissionsPending={stats.action_items.submissions_pending}
            mediaPending={stats.action_items.media_pending}
            lowStockCount={stats.action_items.low_stock_count}
            endingTodayCount={stats.marketplace.auctions.ending_today}
            unlinkedServices={stats.action_items.unlinked_services}
          />
        )}

        {/* Performance & Health Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <AdminPerformanceCard />
          <SystemHealthMonitor />
        </div>

        {/* Analytics Section */}
        <AdminAnalyticsSection />

        {/* Zeppel Stats */}
        <ZeppelStatsSection stats={stats.zeppel} />

        {/* Marketplace Stats */}
        <MarketplaceStatsSection stats={stats.marketplace} />

        {/* Services Stats */}
        {stats.services && <ServicesStatsSection stats={stats.services} />}

        {/* Security & Activity Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <SecurityMetricsCard 
            onViewDetails={handleSecurityClick}
          />
          <LiveActivityFeed 
            onViewAll={handleActivityViewAll}
          />
        </div>

        {/* Alerts & Timeline */}
        <div className="grid gap-4 md:grid-cols-2">
          <AlertsCenter onAlertAction={handleAlertAction} />
          <RecentChangesTimeline />
        </div>

        {/* Data Hub */}
        <AdminDataHub />
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        open={showShortcuts} 
        onOpenChange={setShowShortcuts} 
      />
    </>
  );
};
