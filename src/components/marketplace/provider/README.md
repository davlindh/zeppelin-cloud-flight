# Provider Dashboard Components

## Overview
Provider-specific dashboard components built on top of shared dashboard pattern library.

## Components

### ProviderDashboard
**Location**: `src/pages/marketplace/ProviderDashboard.tsx`

Main dashboard page for service providers featuring:
- Personalized hero with quick stats (Active Services, Pending Bookings, Rating, Revenue)
- 6 keyboard shortcuts (S, B, P, M, R, U)
- Real-time notification center
- Performance metrics card with grade
- 5 analytics charts (Bookings, Conversion, Revenue, Rating, Availability)
- Real-time activity feed
- Quick actions for urgent items

**Features:**
- ✅ Real-time notifications via Supabase subscription
- ✅ Keyboard shortcuts (S=Services, B=Bookings, P=Portfolio, M=Messages, R=Revenue, U=Profile)
- ✅ Performance grading (A-F based on acceptance rate and rating)
- ✅ Responsive layout
- ✅ Dark mode support

### ProviderQuickActions
**Location**: `src/components/marketplace/provider/ProviderQuickActions.tsx`

Alert-style cards for urgent provider actions with color-coded urgency levels.

**Props:**
```typescript
interface QuickAction {
  id: string;
  title: string;
  description: string;
  urgency: 'urgent' | 'important' | 'info';
  icon: React.ElementType;
  actionText: string;
  actionLink: string;
  count?: number;
}
```

## Hooks

### useProviderProfile
**Location**: `src/hooks/marketplace/provider/useProviderProfile.ts`

Fetches provider profile data for authenticated user.

**Returns:**
```typescript
{
  data: ServiceProvider | null;
  isLoading: boolean;
  error: Error | null;
}
```

### useProviderPerformance
**Location**: `src/hooks/marketplace/provider/useProviderPerformance.ts`

Calculates performance metrics from bookings and ratings.

**Metrics:**
- Response Time
- Acceptance Rate
- Average Rating
- Bookings This Month
- Performance Grade (A-F)

**Returns:**
```typescript
{
  actionsToday: number;
  actionsThisWeek: number;
  avgResponseTime: string;
  completionRate: number;
  topAction: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  metrics: PerformanceMetric[];
  comparison: { vsYesterday: number; vsLastWeek: number };
}
```

### useProviderAnalytics
**Location**: `src/hooks/marketplace/provider/useProviderAnalytics.ts`

Generates 5 analytics charts for provider dashboard.

**Charts:**
1. **Bookings** (Line) - Booking requests over time
2. **Conversion** (Bar) - Service performance by bookings
3. **Revenue** (Area) - Revenue breakdown over time
4. **Rating** (Line) - Customer rating trend
5. **Availability** (Pie) - Booked vs available hours

**Parameters:**
- `providerId: string` - Provider UUID
- `days: number` - Number of days to analyze (default: 30)

### useProviderActivity
**Location**: `src/hooks/marketplace/provider/useProviderActivity.ts`

Fetches provider activity feed with real-time updates.

**Activity Types:**
- `booking_request` - New booking received
- `review_received` - Customer left review
- `service_viewed` - Service page viewed
- `service_created` - New service published

### useProviderNotifications
**Location**: `src/hooks/marketplace/provider/useProviderNotifications.ts`

Real-time notifications for bookings, reviews, and messages.

**Features:**
- ✅ Real-time updates via Supabase subscription
- ✅ Unread count tracking
- ✅ Mark as read functionality
- ✅ Urgency levels (urgent, important, info)

**Returns:**
```typescript
{
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => void;
}
```

## Database Schema

### Tables

#### provider_activities
Stores provider activity feed entries.

**Columns:**
- `id` (UUID, PK)
- `provider_id` (UUID, FK → service_providers)
- `activity_type` (TEXT) - Type of activity
- `title` (TEXT) - Activity title
- `description` (TEXT) - Activity description
- `metadata` (JSONB) - Additional data
- `severity` (TEXT) - 'high', 'medium', 'low', 'info'
- `link` (TEXT) - Action link
- `created_at` (TIMESTAMPTZ)

#### provider_notifications
Stores provider notifications.

**Columns:**
- `id` (UUID, PK)
- `provider_id` (UUID, FK → service_providers)
- `title` (TEXT) - Notification title
- `message` (TEXT) - Notification message
- `type` (TEXT) - 'booking', 'review', 'message', 'system'
- `urgency` (TEXT) - 'urgent', 'important', 'info'
- `read` (BOOLEAN) - Read status
- `action_url` (TEXT) - Action link
- `entity_id` (UUID) - Related entity ID
- `metadata` (JSONB) - Additional data
- `created_at` (TIMESTAMPTZ)

### Views

#### provider_performance_metrics
Aggregates provider performance data.

**Columns:**
- `provider_id` (UUID)
- `auth_user_id` (UUID)
- `total_bookings` (INT)
- `confirmed_bookings` (INT)
- `pending_bookings` (INT)
- `completed_bookings` (INT)
- `acceptance_rate` (NUMERIC)
- `avg_rating` (NUMERIC)
- `total_reviews` (INT)
- `response_time` (TEXT)
- `active_services` (INT)
- `portfolio_items` (INT)

### Functions

#### get_provider_revenue_stats(provider_id, days)
Calculates revenue statistics for a provider.

**Returns:**
```json
{
  "total_revenue": 0,
  "avg_booking_value": 0,
  "bookings_count": 0,
  "revenue_by_service": [
    {
      "service_name": "Service Name",
      "revenue": 0,
      "bookings": 0
    }
  ]
}
```

### Triggers

#### notify_provider_new_booking
Fires on `bookings` INSERT to create notification and activity entry.

#### notify_provider_new_review
Fires on `service_reviews` INSERT to create notification and activity entry (if table exists).

## Real-time Features

### Notifications Subscription
```typescript
const channel = supabase
  .channel('provider-notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'provider_notifications',
      filter: `provider_id=eq.${providerId}`,
    },
    () => {
      // Invalidate queries to refetch
    }
  )
  .subscribe();
```

## Security

### Row-Level Security (RLS)
All provider tables have RLS policies ensuring:
- Providers can only view their own data
- Admins can manage all data
- No cross-provider data leakage

**Example Policy:**
```sql
CREATE POLICY "Providers can view own activities"
  ON provider_activities FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM service_providers WHERE auth_user_id = auth.uid()
    )
  );
```

## Testing Checklist

### Database Tests
- [x] All migrations run successfully
- [x] `provider_performance_metrics` view returns data
- [x] Notification triggers fire on booking insert
- [x] RLS policies enforce provider-only access

### Hook Tests
- [x] `useProviderProfile` fetches correct provider
- [x] `useProviderPerformance` calculates metrics correctly
- [x] `useProviderAnalytics` generates 5 charts
- [x] `useProviderActivity` fetches activities
- [x] `useProviderNotifications` real-time updates work

### UI Tests
- [ ] Hero displays provider name and stats
- [ ] All 6 keyboard shortcuts work (S, B, P, M, R, U)
- [ ] Performance card shows grade and metrics
- [ ] Analytics charts render without errors
- [ ] Activity feed displays recent items
- [ ] Notification bell shows unread count
- [ ] Clicking notification marks as read
- [ ] Dark mode works on all components
- [ ] Mobile responsive layout

### Performance Tests
- [ ] Dashboard loads in < 2 seconds
- [ ] No unnecessary re-renders
- [ ] Queries optimized with proper staleTime
- [ ] Real-time subscriptions don't cause lag

### Real-time Tests
- [ ] Create test booking → notification appears
- [ ] Leave test review → notification appears (if applicable)
- [ ] Activity feed updates in real-time
- [ ] Notification count decrements when marked read

## Usage Example

```typescript
import { ProviderDashboard } from '@/pages/marketplace/ProviderDashboard';

// In router
<Route path="/marketplace/provider/dashboard" element={<ProviderDashboard />} />
```

## Future Enhancements

### Planned Features
- [ ] Revenue breakdown by service
- [ ] Booking calendar widget
- [ ] Service performance table
- [ ] Customer insights card
- [ ] Availability quick toggle
- [ ] Reviews snapshot widget

### Improvements
- [ ] Add caching for analytics queries
- [ ] Implement optimistic updates for notifications
- [ ] Add export functionality for analytics
- [ ] Create provider onboarding tour
- [ ] Add performance benchmarking

## Dependencies

### Required Packages
- `@tanstack/react-query` - Data fetching
- `@supabase/supabase-js` - Database client
- `lucide-react` - Icons
- `recharts` - Charts (via shared components)

### Internal Dependencies
- Shared Dashboard Pattern Library (`src/components/dashboard/shared/`)
- Dashboard Types (`src/types/dashboard.ts`)
- Supabase Client (`src/integrations/supabase/client`)

## Support

For issues or questions:
1. Check the shared dashboard pattern library README
2. Review database schema in Supabase dashboard
3. Check RLS policies for access issues
4. Verify real-time subscription is active
