import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, X, Filter, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/marketplace/useProducts';
import { useSearchHistory } from '@/hooks/marketplace/useSearchHistory';
import { useDynamicCategoryNames } from '@/hooks/marketplace/useDynamicCategories';
import { useShop } from '@/contexts/marketplace/ShopContext';


interface EnhancedSearchBarProps {
  placeholder?: string;
  className?: string;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  placeholder = "Search products, brands, categories...",
  className = ""
}) => {
  const { state, dispatch } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useProducts();
  const { searchHistory } = useSearchHistory();
  const { data: categories = [] } = useDynamicCategoryNames();

  // Generate suggestions based on input
  useEffect(() => {
    if (!state.searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const query = state.searchTerm.toLowerCase();
    const allSuggestions = new Set<string>();

    // Add matching product titles
    products.forEach(product => {
      if (product.title.toLowerCase().includes(query)) {
        allSuggestions.add(product.title);
      }
    });

    // Add matching brands
    products.forEach(product => {
      if (product.brand?.toLowerCase().includes(query)) {
        allSuggestions.add(product.brand);
      }
    });

    // Add matching categories
    categories.forEach(category => {
      if (category.toLowerCase().includes(query)) {
        allSuggestions.add(category);
      }
    });

    // Add matching tags
    products.forEach(product => {
      product.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          allSuggestions.add(tag);
        }
      });
    });

    setSuggestions(Array.from(allSuggestions).slice(0, 8));
  }, [state.searchTerm, products, categories]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced popular searches that match our category system
  const popularSearches = ['Electronics', 'Fashion', 'Home', 'headphones', 'laptop', 'clothing'];
  const recentSearches = searchHistory.slice(0, 5).map(item => item.query);

  // Quick category filters
  const quickCategories = ['Electronics', 'Fashion', 'Home', 'Sports'];

  const handleSuggestionClick = (suggestion: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: suggestion });
    setIsOpen(false);
  };

  const handleCategoryFilter = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
    dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    dispatch({ type: 'SET_SEARCH_TERM', payload: newValue });
    setIsOpen(true);
  };

  const handleClear = () => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="space-y-3">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={state.searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pl-12 pr-12 py-4 text-base sm:text-lg h-14 sm:h-16 rounded-xl border-2 focus:border-primary/50 shadow-sm"
          />
          {state.searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-3 top-1/2 h-8 w-8 p-0 -translate-y-1/2 hover-subtle rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Quick Category Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Quick filters:
          </span>
          {quickCategories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-xs px-2 py-1 transition-colors"
              onClick={() => handleCategoryFilter(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-xl shadow-xl max-h-[80vh] sm:max-h-96 overflow-y-auto">
          {/* Auto-complete suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 mb-3 px-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-3 hover-subtle rounded-lg text-sm flex items-center gap-3 transition-colors"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {!state.searchTerm && recentSearches.length > 0 && (
            <div className="p-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-3 px-2">Recent searches</div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-3 py-3 hover-subtle rounded-lg text-sm flex items-center gap-3 transition-colors"
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular searches */}
          {!state.searchTerm && (
            <div className="p-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-3 px-2">Popular searches</div>
              <div className="flex flex-wrap gap-2 px-2">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary text-xs px-3 py-1.5 transition-colors"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
