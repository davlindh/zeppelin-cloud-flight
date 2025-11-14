import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSystemHealth } from '@/hooks/admin/useSystemHealth';
import { Activity, Database, Cloud, HardDrive, Users, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const SystemHealthMonitor = () => {
  const { data: health, isLoading } = useSystemHealth();

  if (isLoading || !health) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500 dark:bg-green-600';
      case 'warning': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'critical': return 'bg-red-500 dark:bg-red-600';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge variant="outline" className="text-green-700 dark:text-green-400 border-green-300 dark:border-green-800">Healthy</Badge>;
      case 'warning': return <Badge variant="outline" className="text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </div>
          {getStatusBadge(health.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Health Score</span>
            <span className="text-2xl font-bold">{health.healthScore}%</span>
          </div>
          <Progress value={health.healthScore} className="h-2" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              DB Response
            </div>
            <p className="text-xl font-semibold">{health.dbResponseTime}ms</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Cloud className="h-4 w-4" />
              API Uptime
            </div>
            <p className="text-xl font-semibold">{health.apiUptime}%</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              Storage
            </div>
            <p className="text-xl font-semibold">
              {formatBytes(health.storageUsed)} / {formatBytes(health.storageMax)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Active Sessions
            </div>
            <p className="text-xl font-semibold">{health.activeSessions}</p>
          </div>
        </div>

        {/* Error Rate */}
        {health.errorRate > 1 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Error rate: {health.errorRate}% (last hour)
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Logs
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Run Diagnostics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
