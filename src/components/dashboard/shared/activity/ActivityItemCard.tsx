import { Badge } from '@/components/ui/badge';
import { ActivityItem } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActivityItemCardProps {
  activity: ActivityItem;
}

export const ActivityItemCard = ({ activity }: ActivityItemCardProps) => {
  const navigate = useNavigate();
  const Icon = activity.icon || Activity;

  const severityColors = {
    high: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  };

  const handleClick = () => {
    if (activity.link) {
      navigate(activity.link);
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
        activity.link ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight">{activity.action}</p>
            {activity.severity && (
              <Badge 
                variant="outline" 
                className={`text-xs shrink-0 ${severityColors[activity.severity]}`}
              >
                {activity.severity}
              </Badge>
            )}
          </div>
          {activity.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {activity.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
