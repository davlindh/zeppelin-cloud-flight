
import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface AdvancedFiltersProps {
  filters: {
    priceRange: [number, number];
    brands: string[];
    inStockOnly: boolean;
    rating: number;
  };
  onFiltersChange: (filters: any) => void;
  availableBrands: string[];
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  availableBrands,
  className = '
}) => {
  const handlePriceRangeChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    onFiltersChange(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    
    const newFilters = { ...filters, brands: newBrands };
    onFiltersChange(newFilters);
  };

  const handleStockToggle = () => {
    const newFilters = { ...filters, inStockOnly: !filters.inStockOnly };
    onFiltersChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, rating };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      priceRange: [0, 10000] as [number, number],
      brands: [],
      inStockOnly: false,
      rating: 0
    };
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = 
    (filters.brands.length > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.rating > 0 ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Price Range</h3>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={10000}
              min={0}
              step={50}
              className="mb-3"
            />
            <div className="flex justify-between text-sm text-slate-600">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Brands */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Brands</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Rating */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Minimum Rating</h3>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.rating === rating}
                  onCheckedChange={() => handleRatingChange(rating === filters.rating ? 0 : rating)}
                />
                <label
                  htmlFor={`rating-${rating}`}
                  className="text-sm text-slate-700 cursor-pointer flex items-center"
                >
                  {rating}+ ⭐
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Stock Status */}
        <div>
          <h3 className="font-medium text-slate-900 mb-3">Availability</h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStockOnly}
              onCheckedChange={handleStockToggle}
            />
            <label htmlFor="in-stock" className="text-sm text-slate-700 cursor-pointer">
              In Stock Only
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
