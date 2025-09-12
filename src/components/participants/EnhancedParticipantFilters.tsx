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

interface FilterOptions {
  roles: string[];
  skills: string[];
  experienceLevel: string[];
  contributionTypes: string[];
}

interface ActiveFilters {
  searchTerm: string;
  roles: string[];
  skills: string[];
  experienceLevel: string[];
  contributionTypes: string[];
}

interface EnhancedParticipantFiltersProps {
  filters: ActiveFilters;
  availableFilters: FilterOptions;
  onFiltersChange: (filters: ActiveFilters) => void;
  resultCount: number;
  totalCount: number;
}

export const EnhancedParticipantFilters: React.FC<EnhancedParticipantFiltersProps> = ({
  filters,
  availableFilters,
  onFiltersChange,
  resultCount,
  totalCount
}) => {
  const updateFilter = (key: keyof ActiveFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: 'roles' | 'skills' | 'experienceLevel' | 'contributionTypes', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      roles: [],
      skills: [],
      experienceLevel: [],
      contributionTypes: []
    });
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.roles.length > 0 || 
    filters.skills.length > 0 || 
    filters.experienceLevel.length > 0 || 
    filters.contributionTypes.length > 0;

  const FilterPopover: React.FC<{
    title: string;
    options: string[];
    selectedValues: string[];
    onToggle: (value: string) => void;
  }> = ({ title, options, selectedValues, onToggle }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
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
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${title}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={() => onToggle(option)}
                />
                <label
                  htmlFor={`${title}-${option}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {option}
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
              Rensa alla
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-4">
      {/* Search and primary filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Sök deltagare, roller, eller färdigheter..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {availableFilters.roles.length > 0 && (
            <FilterPopover
              title="Roller"
              options={availableFilters.roles}
              selectedValues={filters.roles}
              onToggle={(value) => toggleArrayFilter('roles', value)}
            />
          )}
          
          {availableFilters.contributionTypes.length > 0 && (
            <FilterPopover
              title="Bidragstyper"
              options={availableFilters.contributionTypes}
              selectedValues={filters.contributionTypes}
              onToggle={(value) => toggleArrayFilter('contributionTypes', value)}
            />
          )}
          
          {availableFilters.skills.length > 0 && (
            <FilterPopover
              title="Färdigheter"
              options={availableFilters.skills}
              selectedValues={filters.skills}
              onToggle={(value) => toggleArrayFilter('skills', value)}
            />
          )}
          
          {availableFilters.experienceLevel.length > 0 && (
            <FilterPopover
              title="Erfarenhetsnivå"
              options={availableFilters.experienceLevel}
              selectedValues={filters.experienceLevel}
              onToggle={(value) => toggleArrayFilter('experienceLevel', value)}
            />
          )}
        </div>
      </div>

      {/* Active filters and results */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Visar {resultCount} av {totalCount} deltagare</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-1"
            >
              <X className="h-3 w-3 mr-1" />
              Rensa filter
            </Button>
          )}
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {filters.roles.map(role => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
                <button
                  onClick={() => toggleArrayFilter('roles', role)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            {filters.contributionTypes.map(type => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
                <button
                  onClick={() => toggleArrayFilter('contributionTypes', type)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            {filters.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
                <button
                  onClick={() => toggleArrayFilter('skills', skill)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            {filters.experienceLevel.map(level => (
              <Badge key={level} variant="secondary" className="text-xs">
                {level}
                <button
                  onClick={() => toggleArrayFilter('experienceLevel', level)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};