import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvaluationSummary } from '@/hooks/evaluation/useEvaluationSummary';
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
        <CardContent className="py-3 text-xs text-muted-foreground">
          No evaluations yet. Be the first to share your perspective.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="flex items-center justify-between py-3 text-xs">
        <div className="space-y-1">
          <div className="font-medium text-sm">Community evaluation</div>
          <div className="text-muted-foreground">
            {data.count} evaluation{data.count !== 1 ? 's' : ''} ·
            {' '}Avg ECKT {data.avg_eckt.toFixed(1)}/100 ·
            {' '}Weighted {data.weighted_eckt.toFixed(1)}/100
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold">
            {data.avg_rating ? data.avg_rating.toFixed(1) : '–'}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Avg rating
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
