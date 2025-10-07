
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'range';
}

interface MobileFilterSheetProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, optionId: string, checked: boolean) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  children?: React.ReactNode;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
  children
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {filters.map((group) => (
            <div key={group.id} className="space-y-3">
              <h3 className="font-medium text-slate-900">{group.title}</h3>
              <div className="space-y-2">
                {group.options.map((option) => {
                  const isSelected = selectedFilters[group.id]?.includes(option.id) || false;
                  
                  return (
                    <label
                      key={option.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type={group.type === 'radio' ? 'radio' : 'checkbox'}
                          name={group.type === 'radio' ? group.id : undefined}
                          checked={isSelected}
                          onChange={(e) => onFilterChange(group.id, option.id, e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700">{option.label}</span>
                      </div>
                      {option.count && (
                        <Badge variant="outline" className="text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Apply button - sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
          <Button className="w-full" size="lg">
            Apply Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
