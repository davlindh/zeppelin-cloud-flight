/**
 * Shared utility functions for provider dashboard features
 */

export function calculateConversionRate(views: number, bookings: number): number {
  if (views === 0) return 0;
  return Math.round((bookings / views) * 100);
}

export function formatRevenue(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function getPerformanceGrade(conversionRate: number): {
  grade: string;
  color: string;
  message: string;
} {
  if (conversionRate >= 15) return { grade: 'A', color: 'green', message: 'Excellent' };
  if (conversionRate >= 10) return { grade: 'B', color: 'blue', message: 'Good' };
  if (conversionRate >= 5) return { grade: 'C', color: 'yellow', message: 'Average' };
  return { grade: 'D', color: 'red', message: 'Needs Improvement' };
}

export function calculateReviewTrend(recentRating: number, oldRating: number): {
  trend: 'up' | 'down' | 'stable';
  change: number;
} {
  const diff = recentRating - oldRating;
  if (Math.abs(diff) < 0.1) return { trend: 'stable', change: 0 };
  return { trend: diff > 0 ? 'up' : 'down', change: Math.abs(diff) };
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    confirmed: 'text-green-600 dark:text-green-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    completed: 'text-blue-600 dark:text-blue-400',
    cancelled: 'text-red-600 dark:text-red-400',
  };
  return statusColors[status] || 'text-muted-foreground';
}

export function getStatusDot(status: string): string {
  const statusDots: Record<string, string> = {
    confirmed: '🟢',
    pending: '🟡',
    completed: '🔵',
    cancelled: '🔴',
  };
  return statusDots[status] || '⚪';
}
