import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchSuggestionsProps {
  searchTerm: string;
  suggestions: string[];
  trendingSearches: string[];
  onSelectSuggestion: (suggestion: string) => void;
  isVisible: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  searchTerm,
  suggestions,
  trendingSearches,
  onSelectSuggestion,
  isVisible
}) => {
  const { searchHistory, removeFromSearchHistory, clearSearchHistory } = useSearchHistory();

  if (!isVisible) return null;

  const filteredSuggestions = suggestions
    .filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  const recentSearches = searchHistory
    .filter(item => searchTerm === '' || item.query.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-slate-900 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-50 border shadow-lg">
      <CardContent className="p-0">
        {/* Search Suggestions */}
        {filteredSuggestions.length > 0 && (
          <div className="border-b border-slate-200">
            <div className="p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Suggestions
            </div>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(suggestion)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
              >
                <Search className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-700">
                  {highlightText(suggestion, searchTerm)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="border-b border-slate-200">
            <div className="flex items-center justify-between p-3">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Recent Searches
              </div>
              {recentSearches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearchHistory}
                  className="h-6 px-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </Button>
              )}
            </div>
            {recentSearches.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 group"
              >
                <button
                  onClick={() => onSelectSuggestion(item.query)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">
                    {highlightText(item.query, searchTerm)}
                  </span>
                  {item.resultCount && (
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {item.resultCount} results
                    </Badge>
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromSearchHistory(item.query)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Trending Searches */}
        {trendingSearches.length > 0 && (
          <div>
            <div className="p-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Trending
            </div>
            {trendingSearches.slice(0, 3).map((search, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(search)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
              >
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-slate-700">
                  {highlightText(search, searchTerm)}
                </span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  Hot
                </Badge>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredSuggestions.length === 0 && recentSearches.length === 0 && trendingSearches.length === 0 && (
          <div className="p-6 text-center text-slate-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No suggestions available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
