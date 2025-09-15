import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import FilterGroup from './FilterGroup';

// Enhanced Participant Filters Component with Context7 Best Practices
// Features: Advanced filtering, search, sorting, accessibility, performance optimization

interface FilterOption {
  id: string;
  label: string;
  value: string | number;
  count?: number;
  icon?: React.ReactNode;
  color?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'single' | 'multiple' | 'range' | 'search';
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

interface SortOption {
  id: string;
  label: string;
  value: string;
  direction: 'asc' | 'desc';
  icon?: React.ReactNode;
}

type ActiveFilters = Record<string, string[] | { min: number; max: number } | string>;

interface EnhancedParticipantFiltersProps {
  filters: FilterGroup[];
  sortOptions?: SortOption[];
  searchPlaceholder?: string;
  onFiltersChange: (filters: ActiveFilters) => void;
  onSortChange?: (sort: SortOption) => void;
  onSearchChange?: (search: string) => void;
  onReset?: () => void;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
  showSearch?: boolean;
  showSort?: boolean;
  showReset?: boolean;
  compact?: boolean;
  theme?: 'default' | 'modern' | 'minimal';
  animation?: boolean;
  accessibility?: {
    ariaLabel?: string;
    liveRegion?: boolean;
  };
}

const EnhancedParticipantFilters: React.FC<EnhancedParticipantFiltersProps> = ({
  filters,
  sortOptions = [],
  searchPlaceholder = 'Search participants...',
  onFiltersChange,
  onSortChange,
  onSearchChange,
  onReset,
  className,
  layout = 'horizontal',
  showSearch = true,
  showSort = true,
  showReset = true,
  compact = false,
  theme = 'default',
  animation = true,
  accessibility,
}) => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState<SortOption | null>(null);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Handle filter changes
  const handleFilterChange = useCallback((filterId: string, value: string[] | { min: number; max: number } | string) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: value }));
    onFiltersChange({ ...activeFilters, [filterId]: value });
  }, [activeFilters, onFiltersChange]);

  // Handle search changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  // Handle sort changes
  const handleSortChange = useCallback((sort: SortOption) => {
    setSelectedSort(sort);
    onSortChange?.(sort);
  }, [onSortChange]);

  // Handle reset
  const handleReset = useCallback(() => {
    setActiveFilters({});
    setSearchTerm('');
    setSelectedSort(null);
    onFiltersChange({});
    onSearchChange?.('');
    onSortChange?.(sortOptions[0]);
    onReset?.();
  }, [onFiltersChange, onSearchChange, onSortChange, onReset, sortOptions]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'string') {
        return value !== '';
      }
      if (typeof value === 'object' && value !== null) {
        return true; // range objects are considered active
      }
      return false;
    }).length;
  }, [activeFilters]);

  // Generate container classes
  const containerClasses = cn(
    'relative',
    {
      'flex flex-wrap gap-4 items-center': layout === 'horizontal',
      'flex flex-col gap-4': layout === 'vertical',
      'grid gap-4': layout === 'grid',
      'p-4 bg-card border border-border rounded-lg shadow-sm': theme === 'default',
      'p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl shadow-lg': theme === 'modern',
      'p-2 bg-transparent border-none shadow-none': theme === 'minimal',
      'transition-all duration-300 ease-in-out': animation,
    },
    className
  );

  // Search input component
  const SearchInput = () => (
    <div className="relative flex-1 min-w-0">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
        className={cn(
          'block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors',
          {
            'text-sm': compact,
            'text-base': !compact,
          }
        )}
        aria-label={accessibility?.ariaLabel || 'Search participants'}
      />
      {searchTerm && (
        <button
          onClick={() => handleSearchChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          aria-label="Clear search"
        >
          <svg className="h-5 w-5 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );

  // Sort dropdown component
  const SortDropdown = () => (
    <div className="relative">
      <select
        value={selectedSort?.id || ''}
        onChange={(e) => {
          const sort = sortOptions.find(s => s.id === e.target.value);
          if (sort) handleSortChange(sort);
        }}
        className={cn(
          'appearance-none px-3 py-2 pr-8 border border-border rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer',
          {
            'text-sm': compact,
            'text-base': !compact,
          }
        )}
        aria-label="Sort participants"
      >
        <option value="">Sort by...</option>
        {sortOptions.map((sort) => (
          <option key={sort.id} value={sort.id}>
            {sort.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className={containerClasses} role="region" aria-label={accessibility?.ariaLabel || 'Participant filters'}>
      {/* Mobile toggle for compact mode */}
      {compact && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-2 text-left"
          aria-expanded={isExpanded}
        >
          <span className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </span>
          <svg
            className={cn('h-5 w-5 transition-transform', {
              'transform rotate-180': isExpanded,
            })}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Filter content */}
      {(isExpanded || !compact) && (
        <div className={cn(
          'flex flex-wrap gap-4 items-end',
          {
            'flex-col': layout === 'vertical',
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4': layout === 'grid',
          }
        )}>
          {/* Search */}
          {showSearch && (
            <div className={cn('flex-1 min-w-0', {
              'order-first': layout === 'vertical',
            })}>
              <SearchInput />
            </div>
          )}

          {/* Filters */}
          {filters.map((filter) => (
            <div key={filter.id} className="min-w-0">
              <FilterGroup
                filter={filter}
                activeFilters={activeFilters}
                handleFilterChange={handleFilterChange}
                compact={compact}
              />
            </div>
          ))}

          {/* Sort */}
          {showSort && sortOptions.length > 0 && (
            <div className="min-w-0">
              <SortDropdown />
            </div>
          )}

          {/* Reset */}
          {showReset && (activeFilterCount > 0 || searchTerm || selectedSort) && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-accent transition-colors"
              aria-label="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Live region for accessibility */}
      {accessibility?.liveRegion && (
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {activeFilterCount > 0 && `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
          {searchTerm && `Searching for "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export { EnhancedParticipantFilters };
export type { EnhancedParticipantFiltersProps, FilterOption, FilterGroup, SortOption, ActiveFilters };
