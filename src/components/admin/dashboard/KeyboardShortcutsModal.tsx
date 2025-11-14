import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsModal = ({ open, onOpenChange }: KeyboardShortcutsModalProps) => {
  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { key: 'G', description: 'Go to Dashboard' },
        { key: 'A', description: 'View Applications' },
        { key: 'U', description: 'View Users' },
        { key: 'P', description: 'View Products' },
        { key: 'S', description: 'View Services' },
        { key: 'O', description: 'View Orders' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { key: 'R', description: 'Refresh Dashboard' },
        { key: '?', description: 'Show Shortcuts' },
        { key: 'Esc', description: 'Close Modal/Dropdown' },
      ],
    },
    {
      category: 'Search',
      items: [
        { key: '/', description: 'Focus Search' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map(group => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.items.map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50">
                    <span className="text-sm">{item.description}</span>
                    <Kbd>{item.key}</Kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Press <Kbd>Esc</Kbd> to close this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
};
