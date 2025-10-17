import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3x3, List, Calendar, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list' | 'timeline' | 'gallery';

interface MediaViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const MediaViewModeToggle: React.FC<MediaViewModeToggleProps> = ({
  value,
  onChange,
}) => {
  const modes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'grid', icon: <Grid3x3 className="h-4 w-4" />, label: 'Grid' },
    { mode: 'list', icon: <List className="h-4 w-4" />, label: 'List' },
    { mode: 'timeline', icon: <Calendar className="h-4 w-4" />, label: 'Timeline' },
    { mode: 'gallery', icon: <Image className="h-4 w-4" />, label: 'Gallery' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {modes.map(({ mode, icon, label }) => (
        <Button
          key={mode}
          size="sm"
          variant={value === mode ? 'default' : 'ghost'}
          onClick={() => onChange(mode)}
          className={cn('gap-2', value !== mode && 'text-muted-foreground')}
          title={label}
        >
          {icon}
          <span className="hidden md:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
};
