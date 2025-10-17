import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Upload, 
  Grid3x3, 
  List, 
  CheckSquare,
  Trash2,
  Check,
  X
} from 'lucide-react';
import type { MediaFilters } from '@/types/mediaLibrary';

interface MediaToolbarProps {
  filters: MediaFilters;
  onFiltersChange: (filters: MediaFilters) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedCount: number;
  onBulkApprove?: () => void;
  onBulkDelete?: () => void;
  onUpload?: () => void;
  showBulkActions?: boolean;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  onBulkApprove,
  onBulkDelete,
  onUpload,
  showBulkActions = true,
}) => {
  const [localSearch, setLocalSearch] = React.useState(filters.search || '');

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: localSearch });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const activeFilterCount = [
    filters.type,
    filters.status,
    filters.source,
    filters.category,
    filters.is_featured,
    filters.is_public,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left side: Search & Filters */}
      <div className="flex flex-1 items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h4 className="font-semibold">Filter Media</h4>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={filters.type as string || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      type: value === 'all' ? undefined : value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status as string || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      status: value === 'all' ? undefined : value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={filters.source as string || 'all'}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      source: value === 'all' ? undefined : value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="admin-upload">Admin Upload</SelectItem>
                    <SelectItem value="submission">Submission</SelectItem>
                    <SelectItem value="participant">Participant</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="imported">Imported</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={filters.is_featured === true}
                    onCheckedChange={(checked) =>
                      onFiltersChange({
                        ...filters,
                        is_featured: checked ? true : undefined,
                      })
                    }
                  />
                  <Label htmlFor="featured">Featured only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={filters.is_public === true}
                    onCheckedChange={(checked) =>
                      onFiltersChange({
                        ...filters,
                        is_public: checked ? true : undefined,
                      })
                    }
                  />
                  <Label htmlFor="public">Public only</Label>
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  onFiltersChange({
                    search: filters.search,
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right side: Bulk Actions & View Mode */}
      <div className="flex items-center gap-2">
        {/* Bulk Actions */}
        {showBulkActions && selectedCount > 0 && (
          <>
            <Badge variant="secondary">{selectedCount} selected</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkApprove}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-r-none"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-l-none"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Upload Button */}
        <Button onClick={onUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  );
};
