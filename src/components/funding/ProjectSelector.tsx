import React from 'react';
import { useProjects } from '@/hooks/useApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ProjectSelectorProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ value, onChange, disabled }) => {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading projects...</span>
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
        <SelectValue placeholder="Select a project (optional)" />
      </SelectTrigger>
  <SelectContent className="bg-popover border border-border z-50">
    <SelectItem value="none">No project link</SelectItem>
        {projects?.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            <div className="flex items-center gap-2">
              <span>{project.title}</span>
              {project.activeCampaign && (
                <Badge variant="secondary" className="text-xs">
                  Active campaign
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
