import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface SubmissionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
}

export const SubmissionFilters: React.FC<SubmissionFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange
}) => {
  return (
    <div className="flex gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Sök efter titel, email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alla status</SelectItem>
          <SelectItem value="pending">Väntande</SelectItem>
          <SelectItem value="approved">Godkända</SelectItem>
          <SelectItem value="rejected">Avvisade</SelectItem>
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Typ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alla typer</SelectItem>
          <SelectItem value="participant">Deltagare</SelectItem>
          <SelectItem value="project">Projekt</SelectItem>
          <SelectItem value="collaboration">Samarbete</SelectItem>
          <SelectItem value="media">Media</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
