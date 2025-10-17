import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Trash2,
  Download,
  Link2,
  Tag,
  X,
} from 'lucide-react';

interface MediaBulkActionsToolbarProps {
  selectedCount: number;
  onApprove: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  onLink?: () => void;
  onTag?: () => void;
  onClearSelection: () => void;
}

export const MediaBulkActionsToolbar: React.FC<MediaBulkActionsToolbarProps> = ({
  selectedCount,
  onApprove,
  onDelete,
  onDownload,
  onLink,
  onTag,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border shadow-lg rounded-lg p-3 flex items-center gap-3">
        <Badge variant="secondary" className="text-sm">
          {selectedCount} selected
        </Badge>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={onApprove}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </Button>

          {onLink && (
            <Button
              size="sm"
              variant="outline"
              onClick={onLink}
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              Link
            </Button>
          )}

          {onTag && (
            <Button
              size="sm"
              variant="outline"
              onClick={onTag}
              className="gap-2"
            >
              <Tag className="h-4 w-4" />
              Tag
            </Button>
          )}

          {onDownload && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}

          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
