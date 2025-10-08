import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  User, 
  Package, 
  Gavel, 
  Settings, 
  Shield,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAdminActivity } from '@/hooks/useAdminData';

interface LiveActivityFeedProps {
  onViewAll?: () => void;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ onViewAll }) => {
  const { data: activities = [], isLoading } = useAdminActivity();

  const getActivityIcon = (action: string) => {
    if (action.includes('login')) return <User className="h-4 w-4" />;
    if (action.includes('product')) return <Package className="h-4 w-4" />;
    if (action.includes('auction')) return <Gavel className="h-4 w-4" />;
    if (action.includes('role')) return <Settings className="h-4 w-4" />;
    if (action.includes('security')) return <Shield className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getSeverityFromAction = (action: string): 'low' | 'medium' | 'high' | undefined => {
    if (action.includes('role') || action.includes('admin')) return 'high';
    if (action.includes('security') || action.includes('failed')) return 'medium';
    return 'low';
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    
    const variant = severity === 'high' ? 'destructive' : 
                   severity === 'medium' ? 'secondary' : 'outline';
    
    return (
      <Badge variant={variant} className="text-xs">
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getActivityColor = (action: string, severity?: string) => {
    if (severity === 'high') return 'text-red-600 bg-red-50 border-red-200';
    if (severity === 'medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (action.includes('security')) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Activity Feed
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          <ExternalLink className="h-4 w-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading activity...</span>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No recent activity</p>
              ) : (
                activities.slice(0, 10).map((activity) => {
                  const severity = getSeverityFromAction(activity.action);
                  return (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border ${getActivityColor(activity.action, severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getActivityIcon(activity.action)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                by {activity.user_id ? `User ${activity.user_id.slice(0, 8)}...` : 'System'}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {getSeverityBadge(severity)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Real-time activity monitoring active</span>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};