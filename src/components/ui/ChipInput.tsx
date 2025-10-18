import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChipInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const ChipInput: React.FC<ChipInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Skriv och tryck Enter...',
  className,
  disabled
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newChip = inputValue.trim();
      if (!value.includes(newChip)) {
        onChange([...value, newChip]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeChip = (chipToRemove: string) => {
    onChange(value.filter(chip => chip !== chipToRemove));
  };

  return (
    <div className={cn('flex flex-wrap gap-2 p-2 border rounded-md bg-background', className)}>
      {value.map((chip, index) => (
        <Badge key={index} variant="secondary" className="gap-1">
          {chip}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeChip(chip)}
              className="ml-1 hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px] h-auto p-0"
        disabled={disabled}
      />
    </div>
  );
};
