import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UnifiedDashboardLayout } from '@/components/layouts/UnifiedDashboardLayout';
import { DashboardHero } from '@/components/dashboard/shared/hero/DashboardHero';
import { ActionShortcuts } from '@/components/dashboard/shared/actions/ActionShortcuts';
import { PerformanceCard } from '@/components/dashboard/shared/performance/PerformanceCard';
import { AnalyticsSection } from '@/components/dashboard/shared/analytics/AnalyticsSection';
import { ActivityFeed } from '@/components/dashboard/shared/activity/ActivityFeed';
import { ProviderQuickActions } from '@/components/marketplace/provider/ProviderQuickActions';
import { ProviderRevenueCard } from '@/components/marketplace/provider/dashboard/ProviderRevenueCard';
import { BookingCalendar } from '@/components/marketplace/provider/dashboard/BookingCalendar';
import { ServicePerformanceTable } from '@/components/marketplace/provider/dashboard/ServicePerformanceTable';
import { CustomerInsights } from '@/components/marketplace/provider/dashboard/CustomerInsights';
import { AvailabilityWidget } from '@/components/marketplace/provider/dashboard/AvailabilityWidget';
import { ReviewsSnapshot } from '@/components/marketplace/provider/dashboard/ReviewsSnapshot';
import { useProviderProfile } from '@/hooks/marketplace/provider/useProviderProfile';
import { useProviderPerformance } from '@/hooks/marketplace/provider/useProviderPerformance';
import { useProviderAnalytics } from '@/hooks/marketplace/provider/useProviderAnalytics';
import { useProviderActivity } from '@/hooks/marketplace/provider/useProviderActivity';
import { useProviderNotifications } from '@/hooks/marketplace/provider/useProviderNotifications';
import { useDashboardShortcuts } from '@/hooks/dashboard/useDashboardShortcuts';
import { Briefcase, Calendar, Image, MessageSquare, DollarSign, User, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { ShortcutConfig, QuickStat } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state - no provider profile
  if (!profile) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Provider Dashboard</CardTitle>
            <CardDescription className="text-base mt-2">
              You haven't set up your provider profile yet. Create one to start offering services in the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                What you'll get:
              </h4>
              <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                <li>• Professional profile page showcasing your services</li>
                <li>• Dashboard to manage bookings and revenue</li>
                <li>• Direct communication with potential clients</li>
                <li>• Portfolio showcase to display your work</li>
                <li>• Performance analytics and insights</li>
                <li>• Flexible availability management</li>
              </ul>
            </div>
            
            <div className="flex gap-3 justify-center pt-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/marketplace/provider/onboarding">
                  <Briefcase className="h-4 w-4" />
                  Create Provider Profile
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/marketplace">
                  Browse Marketplace
                </Link>
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              Setup takes approximately 10 minutes
            </p>
          </CardContent>
        </Card>
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
    <UnifiedDashboardLayout role="provider">
      <div className="space-y-6">
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
      
      {/* Quick Actions */}
      {quickActions.length > 0 && <ProviderQuickActions actions={quickActions} />}
      
      {/* Revenue & Availability Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ProviderRevenueCard providerId={profile.id} className="lg:col-span-2" />
        <AvailabilityWidget providerId={profile.id} />
      </div>
      
      {/* Booking Calendar & Customer Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <BookingCalendar providerId={profile.id} />
        <CustomerInsights providerId={profile.id} />
      </div>
      
      {/* Service Performance Table */}
      <ServicePerformanceTable providerId={profile.id} />
      
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
      
      {/* Reviews Snapshot */}
      <ReviewsSnapshot providerId={profile.id} />
      
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
    </UnifiedDashboardLayout>
  );
};
