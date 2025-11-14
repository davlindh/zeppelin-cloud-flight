import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminPerformance } from '@/hooks/admin/useAdminPerformance';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Award, Clock, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export const AdminPerformanceCard = () => {
  const { data: performance, isLoading } = useAdminPerformance();

  if (isLoading || !performance) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-600 dark:bg-green-700 text-white';
      case 'B': return 'bg-blue-600 dark:bg-blue-700 text-white';
      case 'C': return 'bg-yellow-600 dark:bg-yellow-700 text-white';
      case 'D': return 'bg-orange-600 dark:bg-orange-700 text-white';
      case 'F': return 'bg-red-600 dark:bg-red-700 text-white';
      default: return 'bg-muted text-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Performance
            </CardTitle>
            <CardDescription>Track your admin activity and efficiency</CardDescription>
          </div>
          <Badge className={`text-xl font-bold ${getGradeColor(performance.efficiencyGrade)}`}>
            {performance.efficiencyGrade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions Today */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Actions Today</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{performance.actionsToday}</span>
              {performance.comparison.vsYesterday !== 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {performance.comparison.vsYesterday > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={performance.comparison.vsYesterday > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(Math.round(performance.comparison.vsYesterday))}%
                  </span>
                </Badge>
              )}
            </div>
          </div>
          <Progress value={(performance.actionsToday / 30) * 100} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Avg Response
            </div>
            <p className="text-lg font-semibold">{performance.avgResponseTime}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              Resolution Rate
            </div>
            <p className="text-lg font-semibold">{performance.resolutionRate}%</p>
          </div>
        </div>

        {/* Top Action */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Most Frequent Action</span>
            <Badge variant="secondary">{performance.topAction}</Badge>
          </div>
        </div>

        {/* This Week */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Actions This Week</span>
            <span className="text-lg font-semibold">{performance.actionsThisWeek}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
