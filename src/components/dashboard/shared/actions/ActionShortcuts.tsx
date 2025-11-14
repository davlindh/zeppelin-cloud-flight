import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShortcutConfig } from '@/types/dashboard';
import { ShortcutButton } from './ShortcutButton';
import { Zap } from 'lucide-react';

interface ActionShortcutsProps {
  shortcuts: ShortcutConfig[];
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4;
  enableKeyboard?: boolean;
}

export const ActionShortcuts = ({
  shortcuts,
  title = 'Quick Actions',
  description = 'Keyboard shortcuts for faster navigation',
  columns = 3,
  enableKeyboard = true,
}: ActionShortcutsProps) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols[columns]} gap-3`}>
          {shortcuts.map((shortcut) => (
            <ShortcutButton 
              key={shortcut.id} 
              shortcut={shortcut}
              showKeyHint={enableKeyboard}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
