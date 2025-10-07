import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';

export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme, effectiveTheme } = useTheme();
  
  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ] as const;
  
  const currentTheme = themeOptions.find(option => option.value === theme) || themeOptions[2];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-9 w-9 p-0 transition-colors",
            "hover:bg-secondary focus:bg-secondary",
            className
          )}
          aria-label={`Current theme: ${currentTheme.label}. Click to change theme.`}
        >
          <span className="text-base" role="img" aria-hidden="true">
            {effectiveTheme === 'dark' ? '🌙' : '☀️'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              theme === option.value && "bg-accent text-accent-foreground"
            )}
          >
            <span role="img" aria-hidden="true">{option.icon}</span>
            <span>{option.label}</span>
            {theme === option.value && (
              <span className="ml-auto text-xs opacity-60">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};