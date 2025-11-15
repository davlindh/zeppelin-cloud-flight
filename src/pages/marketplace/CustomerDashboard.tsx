import React from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { UnifiedDashboardLayout } from '@/components/layouts/UnifiedDashboardLayout';
import { Loader2 } from 'lucide-react';
import { CustomerHero } from '@/components/marketplace/customer/dashboard/CustomerHero';
import { CustomerOrderTracking } from '@/components/marketplace/customer/dashboard/CustomerOrderTracking';
import { CustomerSpendingAnalytics } from '@/components/marketplace/customer/dashboard/CustomerSpendingAnalytics';
import { CustomerRecommendations } from '@/components/marketplace/customer/dashboard/CustomerRecommendations';
import { CustomerFavoritesWidget } from '@/components/marketplace/customer/dashboard/CustomerFavoritesWidget';
import { CustomerActivityFeed } from '@/components/marketplace/customer/dashboard/CustomerActivityFeed';
import { CustomerLoyaltyCard } from '@/components/marketplace/customer/dashboard/CustomerLoyaltyCard';
import { CustomerQuickActions } from '@/components/marketplace/customer/dashboard/CustomerQuickActions';
import { CustomerDonationsWidget } from '@/components/marketplace/customer/dashboard/CustomerDonationsWidget';

export const CustomerDashboard: React.FC = () => {
  const { data: user, isLoading } = useAuthenticatedUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UnifiedDashboardLayout role="customer">
      <div className="space-y-6">
      {/* Hero Section */}
      <CustomerHero />

      {/* Order Tracking - Full Width */}
      <CustomerOrderTracking />

      {/* Donations Widget - Full Width */}
      <CustomerDonationsWidget />

      {/* Quick Actions & Loyalty - Two Columns */}
      <div className="grid gap-4 md:grid-cols-2">
        <CustomerQuickActions />
        <CustomerLoyaltyCard />
      </div>

      {/* Spending Analytics - Full Width */}
      <CustomerSpendingAnalytics />

      {/* Recommendations & Favorites - Responsive Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CustomerRecommendations />
        </div>
        <CustomerFavoritesWidget />
      </div>

      {/* Activity Feed - Full Width */}
      <CustomerActivityFeed />
      </div>
    </UnifiedDashboardLayout>
  );
};
