import { LucideIcon } from 'lucide-react';

export type DashboardRole = 'admin' | 'provider' | 'participant' | 'customer';

export interface QuickStat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendDirection?: 'up' | 'down';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export interface ActivityItem {
  id: string;
  action: string;
  description?: string;
  created_at: string;
  severity?: 'high' | 'medium' | 'low';
  icon?: LucideIcon;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  urgency: 'urgent' | 'important' | 'info';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  entityId?: string;
}

export interface ShortcutConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  key: string;
  path: string;
  badge?: number;
  color?: string;
}

export interface PerformanceMetric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  progressValue?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export interface ChartConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  type: 'line' | 'bar' | 'area' | 'pie';
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  colors?: string[];
}

export interface AnalyticsData {
  charts: ChartConfig[];
  dateRange?: number;
}

export interface DashboardStats {
  totalUsers?: number;
  activeItems?: number;
  revenue?: number;
  growth?: number;
  [key: string]: any;
}
