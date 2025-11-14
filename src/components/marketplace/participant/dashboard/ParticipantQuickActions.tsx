import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle, Star, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantQuickActionsProps {
  profileCompletion?: number;
  mediaCount?: number;
  className?: string;
}

interface ActionItem {
  id: string;
  priority: 'urgent' | 'important' | 'suggested';
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  condition: boolean;
}

const priorityConfig = {
  urgent: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    label: '🔴 Urgent',
  },
  important: {
    icon: Star,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: '🟡 Important',
  },
  suggested: {
    icon: Lightbulb,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    label: '⚪ Suggested',
  },
};

export const ParticipantQuickActions: React.FC<ParticipantQuickActionsProps> = ({
  profileCompletion = 0,
  mediaCount = 0,
  className,
}) => {
  const actions: ActionItem[] = [
    {
      id: 'complete-profile',
      priority: 'urgent',
      title: 'Complete Your Profile',
      description: 'Fill in all profile fields to increase visibility and opportunities',
      actionLabel: 'Complete Profile',
      actionUrl: '/marketplace/profile',
      condition: profileCompletion < 50,
    },
    {
      id: 'upload-media',
      priority: 'important',
      title: 'Add Portfolio Items',
      description: 'Showcase your work by uploading at least 6 photos or videos',
      actionLabel: 'Upload Media',
      actionUrl: '/media',
      condition: mediaCount < 6,
    },
    {
      id: 'enhance-profile',
      priority: 'important',
      title: 'Enhance Your Profile',
      description: 'Add more details to stand out and attract collaborations',
      actionLabel: 'Edit Profile',
      actionUrl: '/marketplace/profile',
      condition: profileCompletion >= 50 && profileCompletion < 100,
    },
    {
      id: 'add-skills',
      priority: 'suggested',
      title: 'Add Your Skills',
      description: 'List your expertise to help others find you for projects',
      actionLabel: 'Add Skills',
      actionUrl: '/marketplace/profile',
      condition: profileCompletion < 80,
    },
    {
      id: 'explore-projects',
      priority: 'suggested',
      title: 'Explore Projects',
      description: 'Browse available projects and start collaborating',
      actionLabel: 'Browse Projects',
      actionUrl: '/projects',
      condition: true,
    },
  ];

  const visibleActions = actions.filter(action => action.condition).slice(0, 3);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleActions.map((action) => {
          const config = priorityConfig[action.priority];
          const Icon = config.icon;

          return (
            <div
              key={action.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all hover:shadow-md",
                config.borderColor,
                config.bgColor
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-full bg-background")}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <span className="text-xs">{config.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {action.description}
                  </p>
                  <Button asChild size="sm" variant={action.priority === 'urgent' ? 'default' : 'outline'}>
                    <Link to={action.actionUrl}>
                      {action.actionLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
