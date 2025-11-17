import React from 'react';
import { useCollaborationProjects } from '@/hooks/funding/useCollaborationProjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface CollaborationProjectSelectorProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  eventId?: string;
}

export const CollaborationProjectSelector: React.FC<CollaborationProjectSelectorProps> = ({
  value,
  onChange,
  disabled,
  eventId,
}) => {
  const { data: projects, isLoading } = useCollaborationProjects({ eventId });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading collaboration projects...</span>
      </div>
    );
  }

  return (
    <Select
      value={value || 'none'}
      onValueChange={(val) => onChange(val === 'none' ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a collaboration project (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No collaboration project link</SelectItem>
        {projects?.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            <div className="flex items-center gap-2">
              <span>{project.title}</span>
              <Badge variant="secondary" className="text-xs">
                {project.status}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
