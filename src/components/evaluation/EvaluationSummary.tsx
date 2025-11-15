import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvaluationSummary } from '@/hooks/evaluation/useEvaluationSummary';
import { BarChart3, Users, TrendingUp } from 'lucide-react';
import type { 
  EvaluationTargetType,
  EvaluationContextScope 
} from '@/hooks/evaluation/types';

interface EvaluationSummaryProps {
  targetType: EvaluationTargetType;
  targetId: string;
  contextScope?: EvaluationContextScope;
  contextId?: string;
  className?: string;
}

export const EvaluationSummary: React.FC<EvaluationSummaryProps> = ({
  targetType,
  targetId,
  contextScope,
  contextId,
  className,
}) => {
  const { data, isLoading } = useEvaluationSummary(
    targetType, 
    targetId,
    contextScope,
    contextId
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center gap-4 py-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.count === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="font-medium">No evaluations yet</p>
          <p className="text-xs mt-1">Be the first to share your perspective</p>
        </CardContent>
      </Card>
    );
  }

  const ecktColor = (value: number) => {
    if (value >= 75) return 'hsl(var(--success))';
    if (value >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <Card className={`border-2 border-primary/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Community Evaluation</h3>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {data.count} evaluation{data.count !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ECKT Scores Section */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Average ECKT</span>
              <span className="font-bold" style={{ color: ecktColor(data.avg_eckt) }}>
                {data.avg_eckt.toFixed(1)}/100
              </span>
            </div>
            <Progress 
              value={data.avg_eckt} 
              className="h-2"
              style={{
                ['--progress-background' as string]: ecktColor(data.avg_eckt)
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Weighted ECKT</span>
              </div>
              <span className="font-bold" style={{ color: ecktColor(data.weighted_eckt) }}>
                {data.weighted_eckt.toFixed(1)}/100
              </span>
            </div>
            <Progress 
              value={data.weighted_eckt} 
              className="h-2"
              style={{
                ['--progress-background' as string]: ecktColor(data.weighted_eckt)
              }}
            />
            <p className="text-[10px] text-muted-foreground">
              Weighted by evaluator reputation and contribution scores
            </p>
          </div>
        </div>

        {/* Average Rating */}
        {data.avg_rating && (
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-sm text-muted-foreground">Average Rating</span>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-foreground">
                {data.avg_rating.toFixed(1)}
              </div>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
