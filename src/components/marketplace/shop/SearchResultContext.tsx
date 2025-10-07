import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Tag, Package, Search } from 'lucide-react';

interface SearchResultContextProps {
  searchTerm: string;
  productsCount: number;
  matchedCategories?: string[];
  suggestedCategory?: string;
  onCategorySelect: (category: string) => void;
}

export const SearchResultContext: React.FC<SearchResultContextProps> = ({
  searchTerm,
  productsCount,
  matchedCategories = [],
  suggestedCategory,
  onCategorySelect
}) => {
  if (!searchTerm) return null;

  return (
    <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          {/* Search context */}
          <div className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Searching for <strong className="text-foreground">"{searchTerm}"</strong>
            </span>
            <Badge variant="outline" className="ml-2">
              <Package className="h-3 w-3 mr-1" />
              {productsCount} {productsCount === 1 ? 'product' : 'products'}
            </Badge>
          </div>

          {/* Matched categories */}
          {matchedCategories.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Found in categories:</span>
              <div className="flex gap-1 flex-wrap">
                {matchedCategories.map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => onCategorySelect(category)}
                    className="h-6 text-xs px-2 hover:bg-primary hover:text-primary-foreground"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested category */}
          {suggestedCategory && !matchedCategories.includes(suggestedCategory) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Did you mean:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCategorySelect(suggestedCategory)}
                className="h-6 text-xs px-2 hover:bg-primary hover:text-primary-foreground"
              >
                Browse {suggestedCategory}
              </Button>
            </div>
          )}

          {/* No results help */}
          {productsCount === 0 && (
            <div className="text-sm text-muted-foreground">
              <p>Try searching for:</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {['Electronics', 'Fashion', 'Home', 'headphones', 'laptop'].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary text-xs"
                    onClick={() => onCategorySelect(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};