import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { EcktSlider } from './EcktSlider';
import { useEvaluationTemplate } from '@/hooks/evaluation/useEvaluationTemplate';
import { useSubmitEvaluation } from '@/hooks/evaluation/useSubmitEvaluation';
import type { 
  EvaluationTargetType,
  EvaluationContextScope 
} from '@/hooks/evaluation/types';

interface EvaluationFormProps {
  targetType: EvaluationTargetType;
  targetId: string;
  templateKey: string;
  contextScope?: EvaluationContextScope;
  contextId?: string;
  compact?: boolean;
  canEvaluate?: boolean;
  onSubmitted?: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  targetType,
  targetId,
  templateKey,
  contextScope,
  contextId,
  compact = false,
  canEvaluate = true,
  onSubmitted,
}) => {
  const { data: template, isLoading: templateLoading } =
    useEvaluationTemplate(templateKey);
  const submitMutation = useSubmitEvaluation();

  const [rating, setRating] = useState<number | null>(null);
  const [ecktValue, setEcktValue] = useState<number>(70);
  const [dimensions, setDimensions] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');

  React.useEffect(() => {
    if (template) {
      const initial: Record<string, number> = {};
      for (const dim of template.dimensions || []) {
        const min = dim.min ?? 1;
        const max = dim.max ?? 5;
        initial[dim.key] = Math.round((min + max) / 2);
      }
      setDimensions(initial);
    }
  }, [template]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    await submitMutation.mutateAsync({
      targetType,
      targetId,
      templateId: template.id,
      rating,
      ecktValue,
      dimensions,
      comment: comment.trim() || undefined,
      contextScope,
      contextId,
    });

    // Reset form
    setComment('');
    setRating(null);
    setEcktValue(70);
    setDimensions({});
    
    onSubmitted?.();
  };

  if (!canEvaluate) {
    return (
      <Card className={compact ? 'border-none shadow-none' : ''}>
        <CardContent className="py-6 text-center text-muted-foreground">
          <p>You cannot evaluate your own work.</p>
          <p className="text-xs mt-2">Log in with a different account to provide feedback.</p>
        </CardContent>
      </Card>
    );
  }

  if (templateLoading) {
    return (
      <Card className={compact ? 'border-none shadow-none' : ''}>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Loading evaluation form…
        </CardContent>
      </Card>
    );
  }

  if (!template) return null;

  return (
    <Card className={compact ? 'border-none shadow-none p-0' : 'mt-4'}>
      <form onSubmit={onSubmit}>
        {!compact && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {template.label || 'Evaluation'}
            </CardTitle>
            {template.description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {template.description}
              </p>
            )}
          </CardHeader>
        )}
        <CardContent className="space-y-4 pt-2">
          <EcktSlider
            value={ecktValue}
            onChange={setEcktValue}
            label="ECKT – How strongly do you stand behind this?"
          />

          <div className="space-y-2">
            <Label className="text-sm">Overall rating (1–5)</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[rating ?? 0]}
                min={0}
                max={5}
                step={1}
                onValueChange={([v]) => setRating(v === 0 ? null : v)}
              />
              <span className="w-6 text-sm text-right tabular-nums">
                {rating ?? '–'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional. Use this for a quick overall impression.
            </p>
          </div>

          {template.dimensions?.length > 0 && (
            <div className="space-y-3">
              {template.dimensions.map((dim) => {
                const min = dim.min ?? 1;
                const max = dim.max ?? 5;
                const step = dim.step ?? 1;
                const val = dimensions[dim.key] ?? min;

                return (
                  <div key={dim.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium">
                        {dim.label}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {val} / {max}
                      </span>
                    </div>
                    <Slider
                      value={[val]}
                      min={min}
                      max={max}
                      step={step}
                      onValueChange={([v]) =>
                        setDimensions((prev) => ({
                          ...prev,
                          [dim.key]: v,
                        }))
                      }
                    />
                    {dim.description && (
                      <p className="text-[11px] text-muted-foreground">
                        {dim.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm">Comment</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share context: what makes this strong, or what could be improved?"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit evaluation'}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
};
