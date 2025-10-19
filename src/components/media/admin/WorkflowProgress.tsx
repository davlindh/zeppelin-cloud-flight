import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  FileStack,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface WorkflowStats {
  total: number;
  pending: number;
  approved: number;
  published: number;
  orphaned: number;
}

interface WorkflowProgressProps {
  stats: WorkflowStats;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ stats }) => {
  const completionRate = stats.total > 0 
    ? ((stats.approved + stats.published) / stats.total) * 100 
    : 0;
  
  const publishedRate = stats.approved > 0 
    ? (stats.published / stats.approved) * 100 
    : 0;

  const orphanedRate = stats.total > 0
    ? (stats.orphaned / stats.total) * 100
    : 0;

  const getTrendIcon = (rate: number) => {
    if (rate > 66) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate < 33) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Media */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totalt media</CardTitle>
          <FileStack className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pending} väntande granskning
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Godkännande</CardTitle>
          {getTrendIcon(completionRate)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate.toFixed(0)}%</div>
          <Progress value={completionRate} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.approved + stats.published} av {stats.total} godkända
          </p>
        </CardContent>
      </Card>

      {/* Published Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Publiceringsgrad</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publishedRate.toFixed(0)}%</div>
          <Progress value={publishedRate} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.published} av {stats.approved} länkade
          </p>
        </CardContent>
      </Card>

      {/* Orphaned Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Föräldralösa filer</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.orphaned}</div>
          <Progress 
            value={orphanedRate} 
            className="h-2 mt-2" 
            // @ts-ignore
            indicatorClassName={orphanedRate > 10 ? "bg-red-600" : undefined}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {orphanedRate > 10 ? (
              <Badge variant="destructive" className="text-xs">
                Kräver åtgärd
              </Badge>
            ) : (
              `${orphanedRate.toFixed(0)}% av totalt`
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};