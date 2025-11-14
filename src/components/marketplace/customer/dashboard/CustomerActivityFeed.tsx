import React, { useState } from 'react';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useCustomerActivity, ActivityType } from '@/hooks/marketplace/customer/useCustomerActivity';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag, Heart, Star, Gavel, Calendar, Eye, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const activityIcons: Record<ActivityType, React.ElementType> = {
  order: ShoppingBag,
  favorite: Heart,
  review: Star,
  bid: Gavel,
  booking: Calendar
};

const activityColors: Record<ActivityType, string> = {
  order: 'text-primary',
  favorite: 'text-destructive',
  review: 'text-yellow-500',
  bid: 'text-purple-500',
  booking: 'text-blue-500'
};

type FilterType = 'all' | ActivityType;

export const CustomerActivityFeed: React.FC = () => {
  const { data: user } = useAuthenticatedUser();
  const { data: activities, isLoading } = useCustomerActivity(user?.id, 20);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredActivities = activities?.filter(
    activity => filter === 'all' || activity.type === filter
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Senaste Aktivitet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Senaste Aktivitet</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Din aktivitet kommer att visas här</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senaste Aktivitet</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Alla
          </Button>
          <Button
            variant={filter === 'order' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('order')}
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Beställningar
          </Button>
          <Button
            variant={filter === 'favorite' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('favorite')}
          >
            <Heart className="h-4 w-4 mr-1" />
            Favoriter
          </Button>
          <Button
            variant={filter === 'review' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('review')}
          >
            <Star className="h-4 w-4 mr-1" />
            Recensioner
          </Button>
          <Button
            variant={filter === 'bid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('bid')}
          >
            <Gavel className="h-4 w-4 mr-1" />
            Bud
          </Button>
        </div>

        {/* Activity Timeline */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filteredActivities?.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 ${colorClass}`}>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {activity.description}
                        </p>
                      </div>
                      {activity.image && (
                        <img
                          src={activity.image}
                          alt=""
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {activity.relativeTime}
                      </span>
                      {activity.linkTo && (
                        <Button asChild variant="link" size="sm" className="h-auto p-0">
                          <Link to={activity.linkTo}>Visa</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {filteredActivities && filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ingen aktivitet av denna typ</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
