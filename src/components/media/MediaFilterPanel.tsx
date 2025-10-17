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
import type { MediaFilters, MediaType, MediaStatus } from '@/types/mediaLibrary';

interface MediaFilterPanelProps {
  filters: MediaFilters;
  onChange: (filters: MediaFilters) => void;
  onClose?: () => void;
}

export const MediaFilterPanel: React.FC<MediaFilterPanelProps> = ({
  filters,
  onChange,
  onClose,
}) => {
  const handleFilterChange = (key: keyof MediaFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof MediaFilters) => {
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
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                <span className="text-xs">
                  {key}: {displayValue}
                </span>
                <button
                  onClick={() => clearFilter(key as keyof MediaFilters)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="space-y-3">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm">Search</Label>
          <Input
            id="search"
            placeholder="Title, description, filename..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          />
        </div>

        {/* Type */}
        <div>
          <Label htmlFor="type" className="text-sm">Type</Label>
          <Select
            value={filters.type as string || 'all'}
            onValueChange={(value) =>
              handleFilterChange('type', value === 'all' ? undefined : value as MediaType)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status" className="text-sm">Status</Label>
          <Select
            value={filters.status as string || 'all'}
            onValueChange={(value) =>
              handleFilterChange('status', value === 'all' ? undefined : value as MediaStatus)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Featured */}
        <div>
          <Label htmlFor="featured" className="text-sm">Featured</Label>
          <Select
            value={
              filters.is_featured === undefined
                ? 'all'
                : filters.is_featured
                ? 'yes'
                : 'no'
            }
            onValueChange={(value) =>
              handleFilterChange(
                'is_featured',
                value === 'all' ? undefined : value === 'yes'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Featured Only</SelectItem>
              <SelectItem value="no">Not Featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Public */}
        <div>
          <Label htmlFor="public" className="text-sm">Visibility</Label>
          <Select
            value={
              filters.is_public === undefined
                ? 'all'
                : filters.is_public
                ? 'public'
                : 'private'
            }
            onValueChange={(value) =>
              handleFilterChange(
                'is_public',
                value === 'all' ? undefined : value === 'public'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
