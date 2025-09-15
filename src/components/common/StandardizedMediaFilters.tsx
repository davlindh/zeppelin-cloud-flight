import React from 'react';
import { Filter, Grid, List, Images, Search, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getMediaTypeName, getCategoryLabel } from '@/utils/mediaHelpers';
import type { MediaType, MediaCategory } from '@/types/media';

export interface MediaFilterConfig {
  enableSearch?: boolean;
  enableTypeFilter?: boolean;
  enableCategoryFilter?: boolean;
  enableSort?: boolean;
  enableViewMode?: boolean;
  availableTypes?: MediaType[];
  availableCategories?: MediaCategory[];
}

export interface MediaFilterState {
  searchQuery: string;
  typeFilter: string;
  categoryFilter: string;
  sortBy: 'title' | 'date' | 'type' | 'size';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'gallery';
}

export interface StandardizedMediaFiltersProps {
  config: MediaFilterConfig;
  state: MediaFilterState;
  totalCount: number;
  filteredCount: number;
  onStateChange: (newState: Partial<MediaFilterState>) => void;
  className?: string;
}

export const StandardizedMediaFilters: React.FC<StandardizedMediaFiltersProps> = ({
  config,
  state,
  totalCount,
  filteredCount,
  onStateChange,
  className
}) => {
  const handleSearchChange = (query: string) => {
    onStateChange({ searchQuery: query });
  };

  const handleTypeFilterChange = (typeFilter: string) => {
    onStateChange({ typeFilter });
  };

  const handleCategoryFilterChange = (categoryFilter: string) => {
    onStateChange({ categoryFilter });
  };

  const handleSortChange = (sortBy: string) => {
    onStateChange({ sortBy: sortBy as MediaFilterState['sortBy'] });
  };

  const handleSortOrderToggle = () => {
    onStateChange({
      sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleViewModeChange = (viewMode: MediaFilterState['viewMode']) => {
    onStateChange({ viewMode });
  };

  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        {config.enableSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Sök media..."
              value={state.searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        )}

        {/* Type Filter */}
        {config.enableTypeFilter && config.availableTypes && config.availableTypes.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={state.typeFilter} onValueChange={handleTypeFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Alla typer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla typer ({totalCount})</SelectItem>
                {config.availableTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getMediaTypeName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Category Filter */}
        {config.enableCategoryFilter && config.availableCategories && config.availableCategories.length > 1 && (
          <Select value={state.categoryFilter} onValueChange={handleCategoryFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alla kategorier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla kategorier</SelectItem>
              {config.availableCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {getCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        {config.enableSort && (
          <div className="flex items-center gap-2">
            <Select value={state.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Titel</SelectItem>
                <SelectItem value="date">Datum</SelectItem>
                <SelectItem value="type">Typ</SelectItem>
                <SelectItem value="size">Storlek</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSortOrderToggle}
              className="px-2"
            >
              {state.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {filteredCount !== totalCount ? `${filteredCount} av ${totalCount}` : `${totalCount}`} objekt
        </div>
      </div>

      {/* View Mode Toggle */}
      {config.enableViewMode && (
        <div className="flex border border-border rounded-md p-1">
          <Button
            variant={state.viewMode === 'gallery' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('gallery')}
            className="px-3"
          >
            <Images className="h-4 w-4" />
          </Button>
          <Button
            variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
            className="px-3"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={state.viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
            className="px-3"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Utility functions for media filtering
export const createMediaFilterConfig = (
  options: Partial<MediaFilterConfig> = {}
): MediaFilterConfig => ({
  enableSearch: true,
  enableTypeFilter: true,
  enableCategoryFilter: true,
  enableSort: true,
  enableViewMode: true,
  ...options,
});

export const createDefaultMediaFilterState = (): MediaFilterState => ({
  searchQuery: '',
  typeFilter: 'all',
  categoryFilter: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
  viewMode: 'grid',
});

export const filterMediaItems = <T extends { title?: string; type?: string; category?: string; created_at?: string; size?: number; description?: string; tags?: string[] }>(
  items: T[],
  filters: MediaFilterState
): T[] => {
  return items.filter(item => {
    // Search filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const searchableFields: (keyof T)[] = ['title', 'description'];
      const matchesSearch = searchableFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      }) || (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)));
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.typeFilter !== 'all' && item.type !== filters.typeFilter) {
      return false;
    }

    // Category filter
    if (filters.categoryFilter !== 'all' && item.category !== filters.categoryFilter) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (filters.sortBy) {
      case 'title':
        aValue = a.title || '';
        bValue = b.title || '';
        break;
      case 'date':
        aValue = new Date(a.created_at || 0).getTime();
        bValue = new Date(b.created_at || 0).getTime();
        break;
      case 'type':
        aValue = a.type || '';
        bValue = b.type || '';
        break;
      case 'size':
        aValue = a.size || 0;
        bValue = b.size || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};
