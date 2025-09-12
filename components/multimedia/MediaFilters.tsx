import React from 'react';
import { Filter, Grid, List, Images } from 'lucide-react';
import { getMediaTypeName, getCategoryLabel } from '@/utils/mediaHelpers';
import type { MediaType, MediaCategory } from '@/types/media';
import { cn } from '@/lib/utils';

interface MediaFiltersProps {
  availableTypes?: MediaType[];
  availableCategories?: MediaCategory[];
  activeTypeFilter: string;
  activeCategoryFilter?: string;
  viewMode: 'grid' | 'list' | 'gallery';
  totalCount: number;
  filteredCount: number;
  onTypeFilterChange: (filter: string) => void;
  onCategoryFilterChange?: (filter: string) => void;
  onViewModeChange: (mode: 'grid' | 'list' | 'gallery') => void;
  showCategoryFilter?: boolean;
}

export const MediaFilters: React.FC<MediaFiltersProps> = ({
  availableTypes = [],
  availableCategories = [],
  activeTypeFilter,
  activeCategoryFilter = 'all',
  viewMode,
  totalCount,
  filteredCount,
  onTypeFilterChange,
  onCategoryFilterChange,
  onViewModeChange,
  showCategoryFilter = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Type filter */}
        {availableTypes.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={activeTypeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="text-sm bg-background border border-border rounded-md px-2 py-1 text-foreground"
            >
              <option value="all">Alla typer ({totalCount})</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {getMediaTypeName(type)} ({availableTypes.filter(t => t === type).length})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Category filter */}
        {showCategoryFilter && availableCategories.length > 1 && onCategoryFilterChange && (
          <div className="flex items-center gap-2">
            <select 
              value={activeCategoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="text-sm bg-background border border-border rounded-md px-2 py-1 text-foreground"
            >
              <option value="all">Alla kategorier</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Results count */}
        <span className="text-sm text-muted-foreground">
          {filteredCount !== totalCount ? `${filteredCount} av ${totalCount}` : `${totalCount}`} objekt
        </span>
      </div>
      
      {/* View mode toggle */}
      <div className="flex border border-border rounded-md">
        <button
          onClick={() => onViewModeChange('gallery')}
          className={cn(
            "p-1.5 rounded-l-md transition-colors",
            viewMode === 'gallery' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background text-muted-foreground hover:text-foreground'
          )}
          title="Gallerivisning"
        >
          <Images className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            "p-1.5 transition-colors",
            viewMode === 'grid' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background text-muted-foreground hover:text-foreground'
          )}
          title="Rutnätsvy"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            "p-1.5 rounded-r-md transition-colors",
            viewMode === 'list' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background text-muted-foreground hover:text-foreground'
          )}
          title="Listvy"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};