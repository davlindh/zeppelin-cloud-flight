import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useParticipantActivity } from '@/hooks/marketplace/participant/useParticipantActivity';
import { Button } from '@/components/ui/button';
import { User, Image, FolderOpen, Award, MessageSquare, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ParticipantActivityFeedProps {
  participantId?: string;
  className?: string;
}

const iconMap = {
  user: User,
  image: Image,
  folder: FolderOpen,
  award: Award,
  message: MessageSquare,
};

const filterOptions = [
  { value: 'all', label: 'All Activity' },
  { value: 'profile_update', label: 'Profile' },
  { value: 'media_upload', label: 'Media' },
  { value: 'project_joined', label: 'Projects' },
  { value: 'skill_added', label: 'Skills' },
];

export const ParticipantActivityFeed: React.FC<ParticipantActivityFeedProps> = ({
  participantId,
  className,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const { data: activities, isLoading } = useParticipantActivity(participantId, 20);

  const filteredActivities = activities?.filter(
    activity => filter === 'all' || activity.type === filter
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <div className="flex gap-2 flex-wrap mt-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!filteredActivities || filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start by updating your profile or uploading media
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const Icon = iconMap[activity.icon];
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        {activity.relativeTime}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    {activity.metadata?.thumbnailUrl && (
                      <img
                        src={activity.metadata.thumbnailUrl}
                        alt={activity.metadata.itemName || ''}
                        className="mt-2 h-16 w-16 object-cover rounded border"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
