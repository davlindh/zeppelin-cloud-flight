import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
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
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground">
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
