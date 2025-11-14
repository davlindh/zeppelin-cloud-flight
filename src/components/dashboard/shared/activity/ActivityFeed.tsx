import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ActivityItem } from '@/types/dashboard';
import { ActivityItemCard } from './ActivityItemCard';
import { Activity, Search } from 'lucide-react';
import { useState } from 'react';

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  description?: string;
  showSearch?: boolean;
  showLiveIndicator?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export const ActivityFeed = ({
  activities,
  title = 'Activity Feed',
  description = 'Recent actions and updates',
  showSearch = true,
  showLiveIndicator = true,
  maxItems = 10,
  onViewAll,
  isLoading = false,
}: ActivityFeedProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = activities
    .filter(activity => 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, maxItems);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {title}
              {showLiveIndicator && (
                <Badge variant="outline" className="gap-1 ml-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        )}

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities found
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <ActivityItemCard key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
