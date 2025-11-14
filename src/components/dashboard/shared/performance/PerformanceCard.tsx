import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PerformanceMetric } from '@/types/dashboard';
import { MetricDisplay } from '../stats/MetricDisplay';
import { Award } from 'lucide-react';

interface PerformanceCardProps {
  title: string;
  description?: string;
  grade?: string;
  metrics: PerformanceMetric[];
  topAction?: string;
  isLoading?: boolean;
}

const gradeColors: Record<string, string> = {
  A: 'bg-green-500',
  B: 'bg-blue-500',
  C: 'bg-yellow-500',
  D: 'bg-orange-500',
  F: 'bg-red-500',
};

export const PerformanceCard = ({
  title,
  description,
  grade,
  metrics,
  topAction,
  isLoading = false,
}: PerformanceCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
              <Award className="h-5 w-5" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {grade && (
            <div className="flex flex-col items-center">
              <div className={`${gradeColors[grade] || 'bg-muted'} text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold`}>
                {grade}
              </div>
              <span className="text-xs text-muted-foreground mt-1">Grade</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <MetricDisplay key={index} {...metric} />
        ))}
        
        {topAction && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">Most frequent action</p>
            <Badge variant="secondary" className="mt-1">
              {topAction}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
