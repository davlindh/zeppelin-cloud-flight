import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminActivity } from '@/hooks/useAdminData';
import { 
  Shield, 
  Users, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings,
  Activity as ActivityIcon,
  Loader2,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface LiveActivityFeedProps {
  onViewAll?: () => void;
}

export const LiveActivityFeed = ({ onViewAll }: LiveActivityFeedProps) => {
  const { data: activities, isLoading } = useAdminActivity();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities?.filter(activity => 
    activity.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActivityIcon = (action: string) => {
    if (action.includes('user')) return Users;
    if (action.includes('product')) return Package;
    if (action.includes('order')) return ShoppingCart;
    if (action.includes('security')) return Shield;
    if (action.includes('application')) return FileText;
    return Settings;
  };

  const getSeverity = (action: string): 'high' | 'medium' | 'low' => {
    if (action.includes('delete') || action.includes('security')) return 'high';
    if (action.includes('update') || action.includes('approve')) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            <CardTitle>Live Activity Feed</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
            {onViewAll && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                View All
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Real-time administrative actions • {filteredActivities?.length || 0} events
        </CardDescription>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredActivities?.slice(0, 20).map((activity) => {
                const Icon = getActivityIcon(activity.action);
                const severity = getSeverity(activity.action);
                
                return (
                  <div
                    key={activity.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp ? format(new Date(activity.timestamp), "HH:mm:ss", { locale: sv }) : 'Recent'}
                        </p>
                      </div>
                      <Badge variant={severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {severity}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
