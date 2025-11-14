import React, { useState } from 'react';
import { DashboardHero } from '@/components/dashboard/shared/hero/DashboardHero';
import { ActionShortcuts } from '@/components/dashboard/shared/actions/ActionShortcuts';
import { PerformanceCard } from '@/components/dashboard/shared/performance/PerformanceCard';
import { AnalyticsSection } from '@/components/dashboard/shared/analytics/AnalyticsSection';
import { ActivityFeed } from '@/components/dashboard/shared/activity/ActivityFeed';
import { NotificationCenter } from '@/components/dashboard/shared/notifications/NotificationCenter';
import { ProviderQuickActions } from '@/components/marketplace/provider/ProviderQuickActions';
import { useProviderProfile } from '@/hooks/marketplace/provider/useProviderProfile';
import { useProviderPerformance } from '@/hooks/marketplace/provider/useProviderPerformance';
import { useProviderAnalytics } from '@/hooks/marketplace/provider/useProviderAnalytics';
import { useProviderActivity } from '@/hooks/marketplace/provider/useProviderActivity';
import { useProviderNotifications } from '@/hooks/marketplace/provider/useProviderNotifications';
import { useDashboardShortcuts } from '@/hooks/dashboard/useDashboardShortcuts';
import { Briefcase, Calendar, Image, MessageSquare, DollarSign, User, Star, AlertCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { ShortcutConfig, QuickStat } from '@/types/dashboard';

export const ProviderDashboard: React.FC = () => {
  const { data: profile, isLoading: profileLoading } = useProviderProfile();
  const { data: performance, isLoading: perfLoading } = useProviderPerformance(profile?.id || '');
  const { data: analytics, isLoading: analyticsLoading } = useProviderAnalytics(profile?.id || '');
  const { data: activities, isLoading: activitiesLoading } = useProviderActivity(profile?.id || '');
  const { notifications, unreadCount, markAsRead } = useProviderNotifications(profile?.id || '');
  
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Provider shortcuts
  const shortcuts: ShortcutConfig[] = [
    { id: 'services', label: 'My Services', icon: Briefcase, key: 'S', path: '/marketplace/services/manage', badge: 0 },
    { id: 'bookings', label: 'Bookings', icon: Calendar, key: 'B', path: '/marketplace/bookings', badge: 0 },
    { id: 'portfolio', label: 'Portfolio', icon: Image, key: 'P', path: '/marketplace/portfolio/manage', badge: 0 },
    { id: 'messages', label: 'Messages', icon: MessageSquare, key: 'M', path: '/marketplace/messages', badge: 0 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, key: 'R', path: '/marketplace/revenue', badge: 0 },
    { id: 'profile', label: 'My Profile', icon: User, key: 'U', path: '/marketplace/profile', badge: 0 },
  ];
  
  useDashboardShortcuts({
    role: 'provider',
    shortcuts,
    enabled: true,
    onShortcutHelp: () => setShowShortcuts(true),
  });
  
  if (profileLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Quick stats for hero
  const quickStats: QuickStat[] = [
    {
      label: 'Active Services',
      value: performance?.metrics.find(m => m.label === 'Bookings This Month')?.value || 0,
      icon: Briefcase,
      trend: 5,
      trendDirection: 'up',
      variant: 'default',
    },
    {
      label: 'Pending Bookings',
      value: 3,
      icon: Calendar,
      trend: 2,
      trendDirection: 'up',
      variant: 'warning',
    },
    {
      label: 'Rating',
      value: profile.rating?.toFixed(1) || '0.0',
      icon: Star,
      variant: 'success',
    },
    {
      label: 'This Month Revenue',
      value: '$4,250',
      icon: DollarSign,
      trend: 23,
      trendDirection: 'up',
      variant: 'success',
    },
  ];
  
  // Quick actions
  const quickActions = [
    {
      id: 'pending-bookings',
      title: 'Pending Bookings',
      description: 'Respond to booking requests',
      urgency: 'urgent' as const,
      icon: AlertCircle,
      actionText: 'Review',
      actionLink: '/marketplace/bookings',
      count: 2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile.name}!</p>
        </div>
        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={() => {
            notifications.filter(n => !n.read).forEach(n => markAsRead(n.id));
          }}
          onDismiss={markAsRead}
        />
      </div>

      {/* Hero Section */}
      <DashboardHero
        role="provider"
        userName={profile.name}
        stats={quickStats}
        actionItemsCount={unreadCount}
        onRefresh={() => window.location.reload()}
        isRefreshing={false}
        customGreeting="Welcome back"
      />
      
      {/* Quick Actions */}
      {quickActions.length > 0 && <ProviderQuickActions actions={quickActions} />}
      
      {/* Action Shortcuts */}
      <ActionShortcuts
        shortcuts={shortcuts}
        columns={3}
        enableKeyboard={true}
      />
      
      {/* Performance & Activity Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Card */}
        {performance && (
          <PerformanceCard
            title="Your Performance"
            description="Last 30 days"
            grade={performance.grade}
            metrics={performance.metrics}
            topAction={performance.topAction}
            isLoading={perfLoading}
          />
        )}
        
        {/* Activity Feed */}
        <ActivityFeed
          activities={activities || []}
          title="Recent Activity"
          showSearch={true}
          showLiveIndicator={true}
          maxItems={10}
          isLoading={activitiesLoading}
        />
      </div>
      
      {/* Analytics Section */}
      {analytics && (
        <AnalyticsSection
          charts={analytics.charts}
          title="Performance Analytics"
          description="Last 30 days"
          defaultTab="bookings"
          isLoading={analyticsLoading}
        />
      )}
    </div>
  );
};
