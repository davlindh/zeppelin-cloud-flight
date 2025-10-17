import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MediaLinkingSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (entityType: 'project' | 'participant', entityId: string) => void;
  mediaId: string;
}

export function MediaLinkingSelector({
  open,
  onOpenChange,
  onLink,
  mediaId,
}: MediaLinkingSelectorProps) {
  const [entityType, setEntityType] = useState<'project' | 'participant'>('project');
  const [selectedId, setSelectedId] = useState<string>('');

  const { data: projects } = useQuery({
    queryKey: ['projects-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .order('title');
      if (error) throw error;
      return data;
    },
    enabled: entityType === 'project',
  });

  const { data: participants } = useQuery({
    queryKey: ['participants-for-linking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: entityType === 'participant',
  });

  const handleLink = () => {
    if (selectedId) {
      onLink(entityType, selectedId);
      onOpenChange(false);
      setSelectedId('');
    }
  };

  const entities = entityType === 'project' ? projects : participants;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Media to Entity</DialogTitle>
          <DialogDescription>
            Choose a project or participant to link this media file to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select
              value={entityType}
              onValueChange={(value) => {
                setEntityType(value as 'project' | 'participant');
                setSelectedId('');
              }}
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

          <div className="space-y-2">
            <Label>
              {entityType === 'project' ? 'Select Project' : 'Select Participant'}
            </Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder={`Choose a ${entityType}...`} />
              </SelectTrigger>
              <SelectContent>
                {entities?.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {'title' in entity ? entity.title : entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={!selectedId}>
            Link Media
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
