import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  action: () => void;
  description: string;
  category: 'navigation' | 'actions' | 'search';
  ctrl?: boolean;
  alt?: boolean;
}

export const useKeyboardShortcuts = (enabled = true, onShortcutHelp?: () => void) => {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    // Navigation
    { key: 'g', action: () => navigate('/admin'), description: 'Go to Dashboard', category: 'navigation' },
    { key: 'a', action: () => navigate('/admin/applications'), description: 'View Applications', category: 'navigation' },
    { key: 'u', action: () => navigate('/admin/users'), description: 'View Users', category: 'navigation' },
    { key: 'p', action: () => navigate('/admin/products'), description: 'View Products', category: 'navigation' },
    { key: 's', action: () => navigate('/admin/services'), description: 'View Services', category: 'navigation' },
    { key: 'o', action: () => navigate('/admin/orders'), description: 'View Orders', category: 'navigation' },
    
    // Actions
    { key: 'r', action: () => window.location.reload(), description: 'Refresh Dashboard', category: 'actions' },
    
    // Search
    { key: '/', action: () => {}, description: 'Focus Search', category: 'search' },
    
    // Help
    { key: '?', action: () => onShortcutHelp?.(), description: 'Show Shortcuts', category: 'actions' },
  ];

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }

      const shortcut = shortcuts.find(s => 
        s.key === e.key.toLowerCase() && 
        (!s.ctrl || e.ctrlKey) && 
        (!s.alt || e.altKey) &&
        !e.metaKey
      );

      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, navigate, onShortcutHelp]);

  return { shortcuts };
};
