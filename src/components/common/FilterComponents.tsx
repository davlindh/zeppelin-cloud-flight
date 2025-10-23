import React from 'react';
import { Search, Filter, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';

// Generic types for filter components
export interface FilterOption {
  id: string;
  label: string;
  value?: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface FilterGroupConfig {
  id: string;
  label: string;
  type: 'search' | 'single' | 'multiple' | 'range';
  placeholder?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface ActiveFilters {
  [key: string]: string[] | { min: number; max: number } | string;
}

// Generic Search Filter Component
interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className
}) => (
  <div className={cn("relative flex-1", className)}>
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10"
    />
  </div>
);

// Generic Multi-Select Filter Component
interface MultiSelectFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  className?: string;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  title,
  options,
  selectedValues,
  onToggle,
  className
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className={cn("flex items-center gap-2", className)}>
        <Filter className="h-4 w-4" />
        {title}
        {selectedValues.length > 0 && (
          <Badge variant="secondary" className="ml-1">
            {selectedValues.length}
          </Badge>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-64" align="start">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${title}-${option.id}`}
                checked={selectedValues.includes(option.id)}
                onCheckedChange={() => onToggle(option.id)}
              />
              <label
                htmlFor={`${title}-${option.id}`}
                className="text-sm cursor-pointer flex-1"
              >
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
                {option.count !== undefined && (
                  <span className="text-muted-foreground ml-2">({option.count})</span>
                )}
              </label>
            </div>
          ))}
        </div>
        {selectedValues.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectedValues.forEach(value => onToggle(value))}
            className="w-full text-xs"
          >
            Clear all
          </Button>
        )}
      </div>
    </PopoverContent>
  </Popover>
);

// Generic Single Select Filter Component
interface SingleSelectFilterProps {
  title: string;
  options: FilterOption[];
  selectedValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SingleSelectFilter: React.FC<SingleSelectFilterProps> = ({
  title,
  options,
  selectedValue,
  onChange,
  placeholder = "Select...",
  className
}) => (
  <div className={cn("flex items-center gap-2", className)}>
    <span className="text-sm font-medium">{title}:</span>
    <Select value={selectedValue} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.label}
            {option.count !== undefined && (
              <span className="text-muted-foreground ml-2">({option.count})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// Active Filters Display Component
interface ActiveFiltersDisplayProps {
  filters: ActiveFilters;
  onRemoveFilter: (key: string, value?: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  className
}) => {
  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return true;
    return Boolean(value);
  });

  if (!hasActiveFilters) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {Object.entries(filters).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          return value.map(item => (
            <Badge key={`${key}-${item}`} variant="secondary" className="text-xs">
              {key}: {item}
              <button
                onClick={() => onRemoveFilter(key, item)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ));
        }
        if (typeof value === 'object' && value !== null && 'min' in value && 'max' in value) {
          return (
            <Badge key={key} variant="secondary" className="text-xs">
              {key}: {value.min} - {value.max}
              <button
                onClick={() => onRemoveFilter(key)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          );
        }
        if (typeof value === 'string' && value) {
          return (
            <Badge key={key} variant="secondary" className="text-xs">
              {key}: {value}
              <button
                onClick={() => onRemoveFilter(key)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          );
        }
        return null;
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-auto p-1 text-xs"
      >
        <X className="h-3 w-3 mr-1" />
        Clear all
      </Button>
    </div>
  );
};

// Results Summary Component
interface ResultsSummaryProps {
  resultCount: number;
  totalCount: number;
  className?: string;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  resultCount,
  totalCount,
  className
}) => (
  <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
    <span>
      Showing {resultCount} of {totalCount} results
    </span>
  </div>
);

// Generic Filter Container Component
interface FilterContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterContainer: React.FC<FilterContainerProps> = ({
  children,
  className
}) => (
  <div className={cn("flex flex-col gap-4", className)}>
    {children}
  </div>
);

// Types are already exported above as interfaces
