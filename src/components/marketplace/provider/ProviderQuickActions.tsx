import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  urgency: 'urgent' | 'important' | 'info';
  icon: React.ElementType;
  actionText: string;
  actionLink: string;
  count?: number;
}

export const ProviderQuickActions: React.FC<{ actions: QuickAction[] }> = ({ actions }) => {
  if (actions.length === 0) return null;
  
  const urgencyColors = {
    urgent: 'border-destructive bg-destructive/5',
    important: 'border-warning bg-warning/5',
    info: 'border-primary bg-primary/5',
  };
  
  const urgencyIcons = {
    urgent: '🔴',
    important: '🟡',
    info: '⚪',
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className={`flex items-center justify-between p-4 rounded-lg border-2 ${urgencyColors[action.urgency]}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{urgencyIcons[action.urgency]}</span>
                <Icon className="h-5 w-5" />
                <div>
                  <h4 className="font-semibold">
                    {action.title}
                    {action.count !== undefined && (
                      <span className="ml-2 text-sm">({action.count})</span>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
              <Button asChild size="sm">
                <Link to={action.actionLink}>{action.actionText}</Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
