# Dashboard Pattern Library

A comprehensive, role-agnostic component library for building consistent dashboard experiences across Admin, Provider, Participant, and Customer interfaces.

## Structure

```
src/components/dashboard/shared/
├── hero/                   # Hero/Header components
│   ├── DashboardHero.tsx
│   ├── LiveClock.tsx
│   └── HeroStats.tsx
├── analytics/             # Chart and analytics components
│   ├── AnalyticsSection.tsx
│   └── ChartCard.tsx
├── performance/           # Performance metrics
│   └── PerformanceCard.tsx
├── activity/              # Activity feed components
│   ├── ActivityFeed.tsx
│   └── ActivityItemCard.tsx
├── actions/               # Quick actions and shortcuts
│   ├── ActionShortcuts.tsx
│   └── ShortcutButton.tsx
├── notifications/         # Notification center
│   ├── NotificationCenter.tsx
│   └── NotificationItemCard.tsx
└── stats/                 # Reusable stat displays
    ├── StatsCard.tsx
    ├── MetricDisplay.tsx
    └── TrendIndicator.tsx
```

## Shared Hooks

```
src/hooks/dashboard/
├── useRolePerformance.ts      # Generic performance metrics
├── useRoleAnalytics.ts        # Generic analytics data
├── useRoleActivity.ts         # Generic activity feed
├── useRoleNotifications.ts    # Generic notifications
└── useDashboardShortcuts.ts   # Keyboard shortcuts
```

## Type Definitions

All shared types are defined in `src/types/dashboard.ts`:
- `DashboardRole`: 'admin' | 'provider' | 'participant' | 'customer'
- `QuickStat`: Quick stat display configuration
- `ActivityItem`: Activity feed item structure
- `NotificationItem`: Notification structure
- `ShortcutConfig`: Keyboard shortcut configuration
- `PerformanceMetric`: Performance metric structure
- `ChartConfig`: Chart configuration for analytics

## Usage Examples

### DashboardHero

```tsx
import { DashboardHero } from '@/components/dashboard/shared/hero/DashboardHero';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

<DashboardHero
  role="provider"
  userName="John Doe"
  stats={[
    { label: 'Active Services', value: 12, icon: Briefcase, trend: 15 },
    { label: 'Total Revenue', value: '$4,250', icon: DollarSign, trend: 23 },
  ]}
  actionItemsCount={3}
  onRefresh={handleRefresh}
  isRefreshing={false}
/>
```

### AnalyticsSection

```tsx
import { AnalyticsSection } from '@/components/dashboard/shared/analytics/AnalyticsSection';
import { TrendingUp, DollarSign } from 'lucide-react';

const charts = [
  {
    id: 'revenue',
    title: 'Revenue',
    icon: DollarSign,
    type: 'line',
    data: monthlyData,
    dataKey: 'revenue',
    color: 'hsl(var(--primary))',
  },
];

<AnalyticsSection
  charts={charts}
  title="Performance Analytics"
  description="Last 30 days"
  isLoading={false}
/>
```

### PerformanceCard

```tsx
import { PerformanceCard } from '@/components/dashboard/shared/performance/PerformanceCard';
import { Clock, CheckCircle } from 'lucide-react';

<PerformanceCard
  title="Your Performance"
  description="Weekly metrics"
  grade="A"
  metrics={[
    { 
      label: 'Response Time', 
      value: '2.3h', 
      icon: Clock, 
      trend: -15,
      progressValue: 85 
    },
    { 
      label: 'Completion Rate', 
      value: '92%', 
      icon: CheckCircle, 
      trend: 5,
      progressValue: 92 
    },
  ]}
  topAction="Service Bookings"
/>
```

### ActivityFeed

```tsx
import { ActivityFeed } from '@/components/dashboard/shared/activity/ActivityFeed';

<ActivityFeed
  activities={activities}
  title="Recent Activity"
  showSearch={true}
  showLiveIndicator={true}
  maxItems={10}
  onViewAll={() => navigate('/activity')}
/>
```

### ActionShortcuts

```tsx
import { ActionShortcuts } from '@/components/dashboard/shared/actions/ActionShortcuts';
import { Briefcase, Calendar, MessageSquare } from 'lucide-react';

const shortcuts = [
  { 
    id: 'services', 
    label: 'My Services', 
    icon: Briefcase, 
    key: 'S', 
    path: '/services',
    badge: 3 
  },
  { 
    id: 'calendar', 
    label: 'Calendar', 
    icon: Calendar, 
    key: 'C', 
    path: '/calendar' 
  },
];

<ActionShortcuts
  shortcuts={shortcuts}
  title="Quick Actions"
  columns={3}
  enableKeyboard={true}
/>
```

### NotificationCenter

```tsx
import { NotificationCenter } from '@/components/dashboard/shared/notifications/NotificationCenter';

const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
} = useRoleNotifications('provider', userId);

<NotificationCenter
  notifications={notifications}
  unreadCount={unreadCount}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  onDismiss={dismissNotification}
  onNotificationClick={(notification) => {
    navigate(notification.actionUrl);
  }}
/>
```

## Implementing Role-Specific Dashboards

### 1. Create role-specific hooks that extend the generic ones

```tsx
// src/hooks/marketplace/provider/useProviderPerformance.ts
import { useRolePerformance } from '@/hooks/dashboard/useRolePerformance';
import { supabase } from '@/integrations/supabase/client';

export function useProviderPerformance(providerId: string) {
  // Fetch provider-specific data
  // ...
  
  // Transform into PerformanceMetric[] format
  return metrics;
}
```

### 2. Use shared components with role-specific data

```tsx
// src/pages/marketplace/ProviderDashboard.tsx
import { DashboardHero } from '@/components/dashboard/shared/hero/DashboardHero';
import { ActionShortcuts } from '@/components/dashboard/shared/actions/ActionShortcuts';
import { useProviderPerformance } from '@/hooks/marketplace/provider/useProviderPerformance';

export const ProviderDashboard = () => {
  const { data: performance } = useProviderPerformance(providerId);
  
  return (
    <>
      <DashboardHero
        role="provider"
        userName={providerName}
        stats={providerStats}
        // ... other props
      />
      
      <ActionShortcuts
        shortcuts={providerShortcuts}
        // ... other props
      />
      
      {/* Add provider-specific components */}
    </>
  );
};
```

## Design System Integration

All components use semantic tokens from the design system:
- `hsl(var(--primary))` for primary colors
- `hsl(var(--card))` for card backgrounds
- `hsl(var(--muted))` for muted elements
- `hsl(var(--border))` for borders
- `hsl(var(--foreground))` for text

Charts use color tokens:
- `hsl(var(--chart-1))` through `hsl(var(--chart-5))` for chart colors

## Accessibility

- All components support keyboard navigation
- Proper ARIA labels and roles
- Focus management
- Screen reader friendly
- Color contrast meets WCAG AA standards

## Performance

- Components use React.memo where appropriate
- Optimized re-renders with proper dependencies
- Efficient query staleTime settings (60s for activity, 5min for analytics)
- Virtual scrolling for long lists (ActivityFeed, NotificationCenter)

## Next Steps

1. **Week 2 Day 3-4**: Build Provider Dashboard using these components
2. **Week 2 Day 5**: Add provider-specific features
3. **Week 3+**: Extend to Participant and Customer dashboards
