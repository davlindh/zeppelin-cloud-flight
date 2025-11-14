import { cn } from '@/lib/utils';

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd = ({ children, className }: KbdProps) => {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center px-2 py-1 text-xs font-semibold',
        'bg-muted border border-border rounded',
        'text-foreground shadow-sm',
        className
      )}
    >
      {children}
    </kbd>
  );
};
