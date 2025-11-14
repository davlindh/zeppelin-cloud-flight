import React, { useState, useEffect } from 'react';
import { useGlobalSearch, SearchResult, SearchResultType } from '@/hooks/useGlobalSearch';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Search, ShoppingBag, Wrench, Gavel, Package, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const resultIcons: Record<SearchResultType, React.ElementType> = {
  product: ShoppingBag,
  service: Wrench,
  auction: Gavel,
  order: Package,
  booking: Calendar
};

const resultLabels: Record<SearchResultType, string> = {
  product: 'Produkter',
  service: 'Tjänster',
  auction: 'Auktioner',
  order: 'Beställningar',
  booking: 'Bokningar'
};

export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { data: results, isLoading } = useGlobalSearch(query, open);

  // Keyboard shortcut: CMD/CTRL + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    navigate(result.link);
  };

  // Group results by type
  const groupedResults = results?.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchResultType, SearchResult[]>);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Sök...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Sök produkter, tjänster, auktioner..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && query.length >= 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Söker...
            </div>
          )}

          {!isLoading && query.length >= 2 && (!results || results.length === 0) && (
            <CommandEmpty>
              <div className="py-6 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Inga resultat</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Prova att söka efter något annat
                </p>
              </div>
            </CommandEmpty>
          )}

          {groupedResults &&
            Object.entries(groupedResults).map(([type, items]) => {
              const Icon = resultIcons[type as SearchResultType];
              const label = resultLabels[type as SearchResultType];

              return (
                <CommandGroup key={type} heading={label}>
                  {items.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={`${type}-${result.id}`}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 p-3"
                    >
                      <div className="flex-shrink-0">
                        {result.image ? (
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{result.title}</p>
                        {result.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      {result.price !== undefined && (
                        <div className="flex-shrink-0 text-sm font-semibold">
                          {result.price} kr
                        </div>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
        </CommandList>
      </CommandDialog>
    </>
  );
};
