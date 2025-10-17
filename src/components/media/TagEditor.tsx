import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TagAutocomplete } from './TagAutocomplete';
import type { MediaLibraryItem } from '@/types/mediaLibrary';

interface TagEditorProps {
  items: MediaLibraryItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tags: string[]) => void;
}

export const TagEditor: React.FC<TagEditorProps> = ({
  items,
  open,
  onOpenChange,
  onSave,
}) => {
  const [tags, setTags] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (items.length === 1) {
      setTags(items[0].tags || []);
    } else {
      setTags([]);
    }
  }, [items]);

  const handleSave = () => {
    onSave(tags);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Tags {items.length > 1 && `(${items.length} items)`}
          </DialogTitle>
          <DialogDescription>
            {items.length === 1
              ? 'Edit tags for this media item'
              : 'Add tags to selected media items'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <TagAutocomplete
            value={tags}
            onChange={setTags}
            placeholder="Add tags..."
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Tags
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
