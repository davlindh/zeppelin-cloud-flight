import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter } from 'lucide-react';

interface MediaFiltersProps {
  filters: {
    type?: string;
    category?: string;
    status?: string;
    search?: string;
  };
  onChange: (filters: any) => void;
  onClose?: () => void;
}

export const MediaFilters: React.FC<MediaFiltersProps> = ({
  filters,
  onChange,
  onClose,
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filter</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="search">Sök</Label>
          <Input
            id="search"
            placeholder="Sök media..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="type">Typ</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) =>
              handleFilterChange('type', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Välj typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla typer</SelectItem>
              <SelectItem value="image">Bilder</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Ljud</SelectItem>
              <SelectItem value="document">Dokument</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              handleFilterChange('status', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Välj status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla statusar</SelectItem>
              <SelectItem value="pending">Väntande</SelectItem>
              <SelectItem value="approved">Godkänd</SelectItem>
              <SelectItem value="rejected">Avvisad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="w-full"
        >
          Rensa alla filter
        </Button>
      )}
    </Card>
  );
};
