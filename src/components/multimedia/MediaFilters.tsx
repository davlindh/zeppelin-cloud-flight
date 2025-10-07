import React from 'react';
import { Filter, Grid, List, Images, ChevronDown } from 'lucide-react';
import { getMediaTypeName, getCategoryLabel } from '@/utils/mediaHelpers';
import type { MediaType, MediaCategory } from '@/types/media';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Type filter */}
        {availableTypes.length > 1 && (
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select 
              value={activeTypeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="pl-9 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="all">Alla typer</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {getMediaTypeName(type)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
        
        {/* Category filter */}
        {showCategoryFilter && availableCategories.length > 1 && onCategoryFilterChange && (
          <div className="relative group">
            <select 
              value={activeCategoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground appearance-none cursor-pointer hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="all">Alla kategorier</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
        
        {/* Results count */}
        <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
          {filteredCount !== totalCount ? (
            <>
              <span className="text-primary font-semibold">{filteredCount}</span>
              <span className="text-muted-foreground mx-1">av</span>
              <span>{totalCount}</span>
            </>
          ) : (
            <span>{totalCount} objekt</span>
          )}
        </Badge>
      </div>
      
      {/* View mode toggle */}
      <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50">
        <button
          onClick={() => onViewModeChange('gallery')}
          className={cn(
            "px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2",
            viewMode === 'gallery' 
              ? 'bg-background text-primary shadow-sm border border-border' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
          title="Gallerivisning"
        >
          <Images className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">Galleri</span>
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            "px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2",
            viewMode === 'grid' 
              ? 'bg-background text-primary shadow-sm border border-border' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
          title="Rutnätsvy"
        >
          <Grid className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">Rutnät</span>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            "px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-2",
            viewMode === 'list' 
              ? 'bg-background text-primary shadow-sm border border-border' 
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
          title="Listvy"
        >
          <List className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">Lista</span>
        </button>
      </div>
    </div>
  );
};