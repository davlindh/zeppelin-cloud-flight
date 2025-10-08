import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Lock
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
  // Mock security metrics - replace with actual hook
  const securityMetrics: SecurityMetric[] = [
    {
      label: 'Failed Login Attempts',
      value: 3,
      max: 10,
      status: 'secure',
      trend: 'down',
      description: 'Last 24 hours'
    },
    {
      label: 'Active Admin Sessions',
      value: 2,
      status: 'secure',
      description: 'Currently logged in'
    },
    {
      label: 'Suspicious Activities',
      value: 1,
      status: 'warning',
      trend: 'up',
      description: 'Requires review'
    },
    {
      label: 'Security Score',
      value: 85,
      max: 100,
      status: 'secure',
      trend: 'stable',
      description: 'Overall system security'
    }
  ];

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Overview
        </CardTitle>
        <Badge variant={getStatusBadgeVariant(overallStatus)} className="flex items-center gap-1">
          {getStatusIcon(overallStatus)}
          {overallStatus.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {securityMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  {metric.trend && getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {metric.value}
                    {metric.max && `/${metric.max}`}
                  </span>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              
              {metric.max && (
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className="h-2"
                />
              )}
              
              {metric.description && (
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              )}
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onViewDetails}
            >
              <Lock className="h-4 w-4 mr-2" />
              View Security Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};