import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardRole, ShortcutConfig } from '@/types/dashboard';

interface UseDashboardShortcutsOptions {
  role: DashboardRole;
  shortcuts: ShortcutConfig[];
  enabled?: boolean;
  onShortcutHelp?: () => void;
}

export const useDashboardShortcuts = ({
  role,
  shortcuts,
  enabled = true,
  onShortcutHelp,
}: UseDashboardShortcutsOptions) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Handle help shortcut
      if (e.key === '?' && onShortcutHelp) {
        e.preventDefault();
        onShortcutHelp();
        return;
      }

      // Find matching shortcut
      const shortcut = shortcuts.find(
        (s) => s.key.toLowerCase() === e.key.toLowerCase() && !e.ctrlKey && !e.metaKey && !e.altKey
      );

      if (shortcut) {
        e.preventDefault();
        navigate(shortcut.path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, navigate, onShortcutHelp, shortcuts]);

  return { shortcuts };
};
