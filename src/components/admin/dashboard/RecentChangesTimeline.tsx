import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAdminActivity } from '@/hooks/marketplace/useAdminData';
import { Clock, Package, Users, ShoppingCart, Settings, Plus, Edit, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export const RecentChangesTimeline = () => {
  const { data: activities, isLoading } = useAdminActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return Plus;
    if (action.includes('update') || action.includes('edit')) return Edit;
    if (action.includes('delete')) return Trash;
    if (action.includes('product')) return Package;
    if (action.includes('user')) return Users;
    if (action.includes('order')) return ShoppingCart;
    return Settings;
  };

  const getActionType = (action: string): 'create' | 'update' | 'delete' | 'other' => {
    if (action.includes('create')) return 'create';
    if (action.includes('update') || action.includes('edit')) return 'update';
    if (action.includes('delete')) return 'delete';
    return 'other';
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'create': return 'text-green-600 bg-green-50 border-green-200';
      case 'update': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delete': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Changes
        </CardTitle>
        <CardDescription>System activity from the last 48 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities?.slice(0, 20).map((activity, index) => {
              const Icon = getActionIcon(activity.action);
              const actionType = getActionType(activity.action);
              
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="relative">
                    <div className={`p-2 rounded-lg border ${getActionColor(actionType)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {index < (activities?.length || 0) - 1 && (
                      <div className="absolute left-1/2 top-10 bottom-0 w-px bg-border -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <Badge variant="outline" className="text-xs">
                        {actionType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      by Admin • {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: sv }) : 'Recently'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
