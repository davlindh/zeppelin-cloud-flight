import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase-extensions';

const supabaseUrl = 'https://paywaomkmjssbtkzwnwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXdhb21rbWpzc2J0a3p3bndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDg0NDIsImV4cCI6MjA3MzAyNDQ0Mn0.NkWnQCMJA3bZQy5746C_SmlWsT3pLnNOOLUNjlPv0tI';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface MediaLinkDialogProps {
  mediaIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (entityType: 'project' | 'participant', entityId: string) => void;
}

export const MediaLinkDialog: React.FC<MediaLinkDialogProps> = ({
  mediaIds,
  open,
  onOpenChange,
  onLink,
}) => {
  const [entityType, setEntityType] = useState<'project' | 'participant'>('project');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');

  const { data: projects } = useQuery({
    queryKey: ['projects-search', searchQuery],
    queryFn: async () => {
      let query = supabase.from('projects').select('id, title, slug');
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      const { data } = await query.limit(20);
      return data || [];
    },
    enabled: entityType === 'project',
  });

  const { data: participants } = useQuery({
    queryKey: ['participants-search', searchQuery],
    queryFn: async () => {
      let query = supabase.from('participants').select('id, name, slug');
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      const { data } = await query.limit(20);
      return data || [];
    },
    enabled: entityType === 'participant',
  });

  const handleLink = () => {
    if (selectedId) {
      onLink(entityType, selectedId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Link Media {mediaIds.length > 1 && `(${mediaIds.length} items)`}
          </DialogTitle>
          <DialogDescription>
            Link selected media to a project or participant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Link To</Label>
            <Select
              value={entityType}
              onValueChange={(v) => setEntityType(v as 'project' | 'participant')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="participant">Participant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Search</Label>
            <Input
              placeholder={`Search ${entityType}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <Label>Select {entityType === 'project' ? 'Project' : 'Participant'}</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${entityType}...`} />
              </SelectTrigger>
              <SelectContent>
                {entityType === 'project' &&
                  projects?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                {entityType === 'participant' &&
                  participants?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleLink} disabled={!selectedId}>
              Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
