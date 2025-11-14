import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useSecurityMetrics } from '@/hooks/useAdminData';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Lock,
  Users,
  MessageSquare,
  Gavel
} from 'lucide-react';

interface SecurityMetric {
  label: string;
  value: number;
  max?: number;
  status: 'secure' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

interface SecurityMetricsCardProps {
  onViewDetails?: () => void;
}

export const SecurityMetricsCard: React.FC<SecurityMetricsCardProps> = ({ onViewDetails }) => {
  const { data: metrics, isLoading } = useSecurityMetrics();

  const securityMetrics: SecurityMetric[] = metrics ? [
    {
      label: 'Total Users',
      value: metrics.totalUsers,
      status: 'secure',
      trend: 'stable',
      description: 'Registered users'
    },
    {
      label: 'Active User Roles',
      value: metrics.activeRoles,
      status: 'secure',
      description: 'Assigned roles'
    },
    {
      label: 'Recent Requests',
      value: metrics.communicationRequests,
      status: metrics.communicationRequests > 10 ? 'warning' : 'secure',
      trend: metrics.communicationRequests > 10 ? 'up' : 'stable',
      description: 'Last 24 hours'
    },
    {
      label: 'Recent Bids',
      value: metrics.recentBids,
      status: 'secure',
      trend: 'stable',
      description: 'Last 24 hours'
    },
    {
      label: 'Admin Actions',
      value: metrics.adminActions,
      max: metrics.adminActions > 0 ? metrics.adminActions * 1.5 : 50,
      status: 'secure',
      trend: 'stable',
      description: 'Last 24 hours'
    }
  ] : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-500" />;
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const overallStatus = securityMetrics.some(m => m.status === 'critical') 
    ? 'critical' 
    : securityMetrics.some(m => m.status === 'warning') 
    ? 'warning' 
    : 'secure';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Overview
        </CardTitle>
        <Badge variant={getStatusBadgeVariant(overallStatus)} className="flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
          {getStatusIcon(overallStatus)}
          {overallStatus.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {securityMetrics.map((metric, index) => (
            <div 
              key={index} 
              className="group space-y-2 p-3 rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/20 transition-all hover:border-primary/30 hover:shadow-sm"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {metric.label}
                  </span>
                  {metric.trend && (
                    <span className="animate-in fade-in zoom-in">
                      {getTrendIcon(metric.trend)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tabular-nums">
                    {metric.value.toLocaleString()}
                    {metric.max && <span className="text-muted-foreground">/{Math.round(metric.max).toLocaleString()}</span>}
                  </span>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              
              {metric.max && (
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className="h-2 transition-all"
                />
              )}
              
              {metric.description && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {metric.description}
                </p>
              )}
            </div>
          ))}
          
          <div className="pt-4 border-t border-border/50 mt-4">
            <Button 
              variant="outline" 
              className="w-full group hover:bg-primary hover:text-primary-foreground transition-all" 
              onClick={onViewDetails}
            >
              <Lock className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              View Security Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};