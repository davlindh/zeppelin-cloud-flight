import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FilterGroup as FilterGroupType, ActiveFilters } from '@/components/participants/EnhancedParticipantFilters';

interface FilterGroupProps {
  filter: FilterGroupType;
  activeFilters: ActiveFilters;
  handleFilterChange: (filterId: string, value: string[] | { min: number; max: number } | string) => void;
  compact?: boolean;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ filter, activeFilters, handleFilterChange, compact }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    const currentValue = activeFilters[filter.id];
    let newValue: string[];

    if (filter.type === 'single') {
      newValue = checked ? [optionId] : [];
    } else {
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      newValue = checked
        ? [...currentArray, optionId]
        : currentArray.filter((id: string) => id !== optionId);
    }

    handleFilterChange(filter.id, newValue);
  };

  const handleRangeChange = (min: number, max: number) => {
    handleFilterChange(filter.id, { min, max });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 text-left border border-border rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors',
          {
            'text-sm': compact,
            'text-base': !compact,
          }
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center">
          {filter.label}
          {Array.isArray(activeFilters[filter.id]) && (activeFilters[filter.id] as string[]).length > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              {(activeFilters[filter.id] as string[]).length}
            </span>
          )}
        </span>
        <svg
          className={cn('h-5 w-5 text-muted-foreground transition-transform', {
            'transform rotate-180': isOpen,
          })}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filter.type === 'search' && (
            <input
              type="text"
              placeholder={filter.placeholder}
              className="w-full px-3 py-2 border-b border-border bg-background"
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            />
          )}

          {filter.type === 'range' && (
            <div className="p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min={filter.min}
                  max={filter.max}
                  className="flex-1 px-2 py-1 border border-border rounded text-sm"
                  onChange={(e) => {
                    const currentValue = activeFilters[filter.id];
                    const max = (typeof currentValue === 'object' && currentValue !== null && 'max' in currentValue)
                      ? currentValue.max
                      : filter.max || 0;
                    handleRangeChange(Number(e.target.value), max);
                  }}
                />
                <span className="text-muted-foreground">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min={filter.min}
                  max={filter.max}
                  className="flex-1 px-2 py-1 border border-border rounded text-sm"
                  onChange={(e) => {
                    const currentValue = activeFilters[filter.id];
                    const min = (typeof currentValue === 'object' && currentValue !== null && 'min' in currentValue)
                      ? currentValue.min
                      : filter.min || 0;
                    handleRangeChange(min, Number(e.target.value));
                  }}
                />
              </div>
            </div>
          )}

          {filter.options && (
            <div className="py-1">
              {filter.options.map((option) => {
                const currentValue = activeFilters[filter.id];
                const isSelected = filter.type === 'single'
                  ? (Array.isArray(currentValue) ? currentValue[0] === option.id : false)
                  : (Array.isArray(currentValue) ? currentValue.includes(option.id) : false);

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionChange(option.id, !isSelected)}
                    className={cn(
                      'flex items-center w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors',
                      {
                        'bg-accent text-accent-foreground': isSelected,
                      }
                    )}
                  >
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    <span className="flex-1">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-muted-foreground text-sm">({option.count})</span>
                    )}
                    {isSelected && (
                      <svg className="ml-2 h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterGroup;
