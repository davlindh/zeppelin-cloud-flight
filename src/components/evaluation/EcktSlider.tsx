import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const ECKT_LABELS = [
  { value: 0, label: 'No' },
  { value: 33, label: 'Maybe' },
  { value: 66, label: 'Yes' },
  { value: 100, label: 'Absolutely' },
];

interface EcktSliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const EcktSlider: React.FC<EcktSliderProps> = ({
  label = 'ECKT – How strongly do you stand behind this?',
  value,
  onChange,
  disabled,
  className,
}) => {
  const currentLabel =
    ECKT_LABELS.reduce((closest, item) => {
      return Math.abs(item.value - value) < Math.abs(closest.value - value)
        ? item
        : closest;
    }, ECKT_LABELS[0])?.label ?? '';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{label}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-semibold mb-1">What is ECKT?</p>
                <p className="text-xs mb-2">
                  ECKT measures how strongly you stand behind this evaluation.
                  It's not just "how good is it" – it's "how much do you commit to this assessment."
                </p>
                <p className="text-xs text-muted-foreground">
                  Your ECKT score is weighted by your Fave Points (reputation score),
                  giving more influence to trusted community members.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {value} / 100 – {currentLabel}
        </span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wide">
        {ECKT_LABELS.map((item) => (
          <span key={item.value}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};
