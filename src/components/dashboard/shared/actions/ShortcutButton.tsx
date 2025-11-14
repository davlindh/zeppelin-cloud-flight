import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShortcutConfig } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

interface ShortcutButtonProps {
  shortcut: ShortcutConfig;
  showKeyHint?: boolean;
}

export const ShortcutButton = ({ shortcut, showKeyHint = true }: ShortcutButtonProps) => {
  const navigate = useNavigate();
  const Icon = shortcut.icon;

  const handleClick = () => {
    navigate(shortcut.path);
  };

  return (
    <Button
      variant="outline"
      className="h-auto flex-col items-start p-4 gap-2 relative hover:bg-accent hover:text-accent-foreground"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between w-full">
        <div className={`p-2 rounded-lg ${shortcut.color || 'bg-primary/10 text-primary'}`}>
          <Icon className="h-4 w-4" />
        </div>
        {showKeyHint && (
          <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
            {shortcut.key}
          </kbd>
        )}
      </div>
      <div className="w-full text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{shortcut.label}</span>
          {shortcut.badge !== undefined && shortcut.badge > 0 && (
            <Badge variant="destructive" className="ml-2">
              {shortcut.badge}
            </Badge>
          )}
        </div>
      </div>
    </Button>
  );
};
