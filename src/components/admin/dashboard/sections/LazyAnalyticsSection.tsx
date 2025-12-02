import { lazy, Suspense } from 'react';
import { usePermissionGate } from '@/hooks/useOptimizedDashboardStats';

// Lazy load the actual analytics component
const AnalyticsSection = lazy(() =>
  import('./AnalyticsSection').then(module => ({
    default: module.AnalyticsSection
  }))
);

// Skeleton placeholder
const AnalyticsSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-6 w-48 bg-muted rounded animate-pulse" />
      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-64 bg-muted rounded animate-pulse" />
      <div className="h-64 bg-muted rounded animate-pulse" />
    </div>
  </div>
);

// Only render if permission granted
export const LazyAnalyticsSection: React.FC = () => {
  const hasPermission = usePermissionGate('analytics.view');

  if (!hasPermission) {
    return null;
  }

  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsSection />
    </Suspense>
  );
};
