import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Sparkles, Heart, Users, Star, Target } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ScoreHistoryProps {
  userId: string;
  className?: string;
}

interface ScoreTransaction {
  delta: number;
  reason: string;
  context_type: string;
  context_id: string;
  created_at: string;
  metadata?: any;
}

export const ScoreHistory: React.FC<ScoreHistoryProps> = ({ userId, className }) => {
  const [timeFilter, setTimeFilter] = useState('all');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['score-history', userId, timeFilter],
    queryFn: async (): Promise<ScoreTransaction[]> => {
      let query = supabase
        .from('fave_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const now = new Date();

      switch (timeFilter) {
        case 'week':
          query = query.gte('created_at', startOfWeek(now).toISOString());
          break;
        case 'month':
          query = query.gte('created_at', startOfMonth(now).toISOString());
          break;
        case '3months':
          query = query.gte('created_at', addDays(now, -90).toISOString());
          break;
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'donation_made':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'event_attendance':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'project_contribution':
      case 'collaboration_points':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'task_completed':
      case 'milestone_reached':
        return <Target className="h-4 w-4 text-green-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-purple-500" />;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'donation_made':
        return 'Donation';
      case 'event_attendance':
        return 'Event Attendance';
      case 'project_contribution':
        return 'Project Contribution';
      case 'collaboration_points':
        return 'Collaboration';
      case 'task_completed':
        return 'Task Completed';
      case 'milestone_reached':
        return 'Milestone';
      case 'donation_refunded':
        return 'Refunded Donation';
      default:
        return reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getTransactionSummary = (transactions: ScoreTransaction[]) => {
    const currentDate = new Date();
    const thisWeek = transactions.filter(t =>
      new Date(t.created_at) >= startOfWeek(currentDate)
    );
    const thisMonth = transactions.filter(t =>
      new Date(t.created_at) >= startOfMonth(currentDate)
    );

    const byReason = transactions.reduce((acc, t) => {
      acc[t.reason] = (acc[t.reason] || 0) + t.delta;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEarned: transactions.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0),
      totalSpent: Math.abs(transactions.filter(t => t.delta < 0).reduce((sum, t) => sum + t.delta, 0)),
      thisWeek: thisWeek.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0),
      thisMonth: thisMonth.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0),
      byReason
    };
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Score History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = getTransactionSummary(transactions || []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Score History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              +{summary.totalEarned.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Earned</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              +{summary.thisWeek.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              +{summary.thisMonth.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {Object.keys(summary.byReason).length}
            </div>
            <div className="text-xs text-muted-foreground">Activity Types</div>
          </div>
        </div>

        {/* Time Filter */}
        <Tabs value={timeFilter} onValueChange={setTimeFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="3months">3 Months</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Transactions List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.created_at}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0">
                    {getReasonIcon(transaction.reason)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getReasonLabel(transaction.reason)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.context_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                    </div>
                  </div>
                  <div className={cn(
                    'font-bold text-lg',
                    transaction.delta > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}>
                    {transaction.delta > 0 ? '+' : ''}{transaction.delta}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No activity in selected period</p>
                <p className="text-sm">Try selecting a different time range</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Activity Breakdown */}
        {Object.keys(summary.byReason).length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">Points by Activity</h4>
            <div className="space-y-2">
              {Object.entries(summary.byReason).map(([reason, points]) => (
                <div key={reason} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getReasonIcon(reason)}
                    <span className="text-sm">{getReasonLabel(reason)}</span>
                  </div>
                  <span className={cn(
                    'font-semibold',
                    points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {points > 0 ? '+' : ''}{points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
