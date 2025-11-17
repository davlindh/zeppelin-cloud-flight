import React from 'react';
import { useEvents } from '@/hooks/useEvents';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface EventSelectorProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export const EventSelector: React.FC<EventSelectorProps> = ({ value, onChange, disabled }) => {
  const { data: events, isLoading } = useEvents({ status: 'published', includePast: false });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading events...</span>
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
        <SelectValue placeholder="Select an event (optional)" />
      </SelectTrigger>
  <SelectContent className="bg-popover border border-border z-50">
    <SelectItem value="none">No event link</SelectItem>
        {events?.map((event) => (
          <SelectItem key={event.id} value={event.id}>
            <div className="flex items-center gap-2">
              <span>{event.title}</span>
              <Badge variant="outline" className="text-xs">
                {format(new Date(event.starts_at), 'MMM d, yyyy')}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
