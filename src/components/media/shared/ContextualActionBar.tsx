import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Trash2,
  Tag,
  SplitSquareHorizontal,
  X,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Action {
  key: string;
  label: string;
  enabled: boolean;
  icon?: React.ReactNode;
}

interface ContextualActionBarProps {
  /** Number of selected items */
  selectedCount: number;

  /** Available actions */
  actions: Action[];

  /** Action handler */
  onAction: (actionKey: string) => void;

  /** Clear selection handler */
  onClearSelection: () => void;

  /** Custom class name */
  className?: string;

  /** Show as compact */
  compact?: boolean;
}

export const ContextualActionBar: React.FC<ContextualActionBarProps> = ({
  selectedCount,
  actions,
  onAction,
  onClearSelection,
  className,
  compact = false
}) => {
  // Get default icons for action types
  const getActionIcon = (actionKey: string) => {
    switch (actionKey) {
      case 'download':
        return <Download className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'bulk-tag':
        return <Tag className="w-4 h-4" />;
      case 'convert':
        return <SplitSquareHorizontal className="w-4 h-4" />;
      case 'bulk-categorize':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get button variant based on action type
  const getButtonVariant = (actionKey: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (actionKey) {
      case 'delete':
        return 'destructive';
      case 'download':
        return 'default';
      case 'bulk-tag':
      case 'convert':
      case 'bulk-categorize':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "bg-background border-b shadow-sm px-4 py-3 flex items-center justify-between gap-4",
          className
        )}
      >
        {/* Left side - Selection info */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {selectedCount} selected
          </Badge>

          {!compact && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Use actions below or press Escape to clear selection
            </span>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Action buttons */}
          {actions.map((action) => (
            <Button
              key={action.key}
              variant={getButtonVariant(action.key)}
              size={compact ? "sm" : "default"}
              onClick={() => onAction(action.key)}
              disabled={!action.enabled}
              className={cn(
                "gap-2",
                compact && "px-2 text-xs"
              )}
            >
              {getActionIcon(action.key)}
              {!compact && action.label}
              {compact && getActionIcon(action.key)?.props?.children ? null : action.label.slice(0, 3) + '...'}
            </Button>
          ))}

          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Clear selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            title="Clear selection"
          >
            {compact ? <X className="w-4 h-4" /> : 'Clear'}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
