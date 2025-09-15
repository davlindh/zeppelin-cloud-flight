import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { SearchFilter, MultiSelectFilter, SingleSelectFilter, ActiveFiltersDisplay, ResultsSummary, FilterContainer } from './FilterComponents';
import { FilterOption, ActiveFilters } from './FilterComponents';

// Enhanced filter types for the unified system
interface FilterConfigInternal {
  id: string;
  label: string;
  type: 'search' | 'single' | 'multiple' | 'range' | 'date';
  placeholder?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  dateRange?: boolean;
  searchable?: boolean;
  groupable?: boolean;
}

interface FilterStateInternal {
  activeFilters: ActiveFilters;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'table';
  page: number;
  limit: number;
}

interface FilterActionsInternal {
  setFilter: (key: string, value: unknown) => void;
  removeFilter: (key: string, value?: string) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSort: (field: string, order?: 'asc' | 'desc') => void;
  setViewMode: (mode: 'grid' | 'list' | 'table') => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

// Public interfaces
export interface FilterConfig {
  id: string;
  label: string;
  type: 'search' | 'single' | 'multiple' | 'range' | 'date';
  placeholder?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  dateRange?: boolean;
  searchable?: boolean;
  groupable?: boolean;
}

export interface FilterState {
  activeFilters: ActiveFilters;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'table';
  page: number;
  limit: number;
}

export interface FilterActions {
  setFilter: (key: string, value: unknown) => void;
  removeFilter: (key: string, value?: string) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  setSort: (field: string, order?: 'asc' | 'desc') => void;
  setViewMode: (mode: 'grid' | 'list' | 'table') => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

export interface FilterSystemProps {
  config: FilterConfig[];
  data: unknown[];
  filterFunction?: (item: unknown, filters: ActiveFilters, searchQuery: string) => boolean;
  sortFunction?: (a: unknown, b: unknown, sortBy: string, sortOrder: 'asc' | 'desc') => number;
  children?: React.ReactNode;
  className?: string;
}

// Filter reducer
type FilterAction =
  | { type: 'SET_FILTER'; payload: { key: string; value: unknown } }
  | { type: 'REMOVE_FILTER'; payload: { key: string; value?: string } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: { field: string; order: 'asc' | 'desc' } }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' | 'table' }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_LIMIT'; payload: number }
  | { type: 'RESET' };

const initialState: FilterState = {
  activeFilters: {},
  searchQuery: '',
  sortBy: '',
  sortOrder: 'asc',
  viewMode: 'grid',
  page: 1,
  limit: 20,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          [action.payload.key]: action.payload.value as string | string[] | { min: number; max: number },
        },
        page: 1, // Reset to first page when filters change
      };

    case 'REMOVE_FILTER': {
      const { [action.payload.key]: removed, ...remainingFilters } = state.activeFilters;
      if (action.payload.value && Array.isArray(removed)) {
        // Remove specific value from array
        const newArray = removed.filter(v => v !== action.payload.value);
        return {
          ...state,
          activeFilters: {
            ...remainingFilters,
            ...(newArray.length > 0 ? { [action.payload.key]: newArray } : {}),
          },
          page: 1,
        };
      }
      return {
        ...state,
        activeFilters: remainingFilters,
        page: 1,
      };
    }

    case 'CLEAR_FILTERS':
      return {
        ...state,
        activeFilters: {},
        searchQuery: '',
        page: 1,
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        page: 1,
      };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.field,
        sortOrder: action.payload.order,
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'SET_PAGE':
      return {
        ...state,
        page: action.payload,
      };

    case 'SET_LIMIT':
      return {
        ...state,
        limit: action.payload,
        page: 1,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Context for filter system
const FilterSystemContext = createContext<{
  state: FilterState;
  actions: FilterActions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filteredData: any[];
  totalCount: number;
  config: FilterConfig[];
} | null>(null);

FilterSystemContext.displayName = 'FilterSystemContext';

// Main FilterSystem component
export const FilterSystem: React.FC<FilterSystemProps> = ({
  config,
  data,
  filterFunction,
  sortFunction,
  children,
  className,
}) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  // Default filter function
  const defaultFilterFunction = useCallback((item: any, filters: ActiveFilters, searchQuery: string) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Apply search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const searchableFields = ['title', 'name', 'description', 'content', 'tags'];
      const matchesSearch = searchableFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        if (Array.isArray(value)) {
          return value.some(v => typeof v === 'string' && v.toLowerCase().includes(searchLower));
        }
        return false;
      });
      if (!matchesSearch) return false;
    }

    // Apply filters
    for (const [key, filterValue] of Object.entries(filters)) {
      const itemValue = item[key];

      if (Array.isArray(filterValue)) {
        if (!filterValue.includes(itemValue)) return false;
      } else if (typeof filterValue === 'object' && filterValue !== null) {
        // Range filter
        if ('min' in filterValue && 'max' in filterValue) {
          if (itemValue < filterValue.min || itemValue > filterValue.max) return false;
        }
      } else {
        if (itemValue !== filterValue) return false;
      }
    }

    return true;
  }, []);

  // Default sort function
  const defaultSortFunction = useCallback((a: any, b: any, sortBy: string, sortOrder: 'asc' | 'desc') => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!sortBy) return 0;

    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (sortBy.includes('date') || sortBy.includes('Date') || sortBy.includes('At')) {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    const filterFn = filterFunction || defaultFilterFunction;
    const sortFn = sortFunction || defaultSortFunction;

    const filtered = data.filter(item => filterFn(item, state.activeFilters, state.searchQuery));

    if (state.sortBy) {
      filtered.sort((a, b) => sortFn(a, b, state.sortBy, state.sortOrder));
    }

    return filtered;
  }, [data, state.activeFilters, state.searchQuery, state.sortBy, state.sortOrder, filterFunction, sortFunction, defaultFilterFunction, defaultSortFunction]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (state.page - 1) * state.limit;
    const end = start + state.limit;
    return filteredData.slice(start, end);
  }, [filteredData, state.page, state.limit]);

  // Actions
  const actions: FilterActions = useMemo(() => ({
    setFilter: (key: string, value: any) => dispatch({ type: 'SET_FILTER', payload: { key, value } }), // eslint-disable-line @typescript-eslint/no-explicit-any
    removeFilter: (key: string, value?: string) => dispatch({ type: 'REMOVE_FILTER', payload: { key, value } }),
    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),
    setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    setSort: (field: string, order = 'asc') => dispatch({ type: 'SET_SORT', payload: { field, order } }),
    setViewMode: (mode: 'grid' | 'list' | 'table') => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
    setPage: (page: number) => dispatch({ type: 'SET_PAGE', payload: page }),
    setLimit: (limit: number) => dispatch({ type: 'SET_LIMIT', payload: limit }),
    reset: () => dispatch({ type: 'RESET' }),
  }), []);

  const contextValue = {
    state,
    actions,
    filteredData: paginatedData,
    totalCount: filteredData.length,
    config,
  };

  return (
    <FilterSystemContext.Provider value={contextValue}>
      <div className={className}>
        {children}
      </div>
    </FilterSystemContext.Provider>
  );
};

// Hook to use filter system
export const useFilterSystem = () => {
  const context = useContext(FilterSystemContext);
  if (!context) {
    throw new Error('useFilterSystem must be used within a FilterSystem');
  }
  return context;
};

// Pre-built filter components for common use cases
export const FilterBar: React.FC<{ className?: string }> = ({ className }) => {
  const { state, actions, config } = useFilterSystem();

  const searchConfig = config.find(c => c.type === 'search');
  const filterConfigs = config.filter(c => c.type !== 'search');

  return (
    <FilterContainer className={className}>
      <div className="flex flex-wrap gap-4 items-center">
        {searchConfig && (
          <SearchFilter
            value={state.searchQuery}
            onChange={actions.setSearchQuery}
            placeholder={searchConfig.placeholder}
            className="min-w-64"
          />
        )}

        {filterConfigs.map(filterConfig => {
          switch (filterConfig.type) {
            case 'multiple': {
              return (
                <MultiSelectFilter
                  key={filterConfig.id}
                  title={filterConfig.label}
                  options={filterConfig.options || []}
                  selectedValues={Array.isArray(state.activeFilters[filterConfig.id])
                    ? state.activeFilters[filterConfig.id] as string[]
                    : []
                  }
                  onToggle={(value) => {
                    const current = state.activeFilters[filterConfig.id] as string[] || [];
                    const newValue = current.includes(value)
                      ? current.filter(v => v !== value)
                      : [...current, value];
                    actions.setFilter(filterConfig.id, newValue);
                  }}
                />
              );
            }

            case 'single': {
              return (
                <SingleSelectFilter
                  key={filterConfig.id}
                  title={filterConfig.label}
                  options={filterConfig.options || []}
                  selectedValue={state.activeFilters[filterConfig.id] as string}
                  onChange={(value) => actions.setFilter(filterConfig.id, value)}
                  placeholder={filterConfig.placeholder}
                />
              );
            }

            default:
              return null;
          }
        })}
      </div>

      <ActiveFiltersDisplay
        filters={state.activeFilters}
        onRemoveFilter={actions.removeFilter}
        onClearAll={actions.clearFilters}
      />
    </FilterContainer>
  );
};

export const FilterResults: React.FC<{ className?: string }> = ({ className }) => {
  const { state, totalCount } = useFilterSystem();

  return (
    <ResultsSummary
      resultCount={totalCount}
      totalCount={totalCount} // This would be the original total before filtering
      className={className}
    />
  );
};

// Utility functions for filter configuration
export const createFilterConfig = (
  id: string,
  label: string,
  type: FilterConfig['type'],
  options?: FilterOption[],
  additionalProps?: Partial<FilterConfig>
): FilterConfig => ({
  id,
  label,
  type,
  options,
  ...additionalProps,
});

export const createSearchFilter = (
  placeholder = "Search...",
  additionalProps?: Partial<FilterConfig>
): FilterConfig => ({
  id: 'search',
  label: 'Search',
  type: 'search',
  placeholder,
  ...additionalProps,
});

export const createMultiSelectFilter = (
  id: string,
  label: string,
  options: FilterOption[],
  additionalProps?: Partial<FilterConfig>
): FilterConfig => ({
  id,
  label,
  type: 'multiple',
  options,
  ...additionalProps,
});

export const createSingleSelectFilter = (
  id: string,
  label: string,
  options: FilterOption[],
  additionalProps?: Partial<FilterConfig>
): FilterConfig => ({
  id,
  label,
  type: 'single',
  options,
  ...additionalProps,
});

// Types are already exported above
