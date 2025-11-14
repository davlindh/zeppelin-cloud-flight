import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ActionItem } from '@/hooks/useRoleActionItems';

interface ActionItemCardProps {
  item: ActionItem;
}

const priorityConfig = {
  critical: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20'
  },
  recommended: {
    icon: CheckCircle2,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20'
  },
  optional: {
    icon: Info,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border'
  }
};

export const ActionItemCard: React.FC<ActionItemCardProps> = ({ item }) => {
  const config = priorityConfig[item.priority];
  const Icon = config.icon;

  return (
    <Card className={`${config.borderColor} ${config.bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 ${config.color} mt-0.5 flex-shrink-0`} />
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-semibold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            {item.link && (
              <Button asChild size="sm" variant="outline">
                <Link to={item.link}>{item.action}</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
