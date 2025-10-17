import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Tag } from 'lucide-react';
import { useMediaTags } from '@/hooks/useMediaTags';
import { cn } from '@/lib/utils';

interface TagAutocompleteProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  className,
}) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { searchTags } = useMediaTags();
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = searchTags(input).filter(
    t => !value.includes(t.tag)
  );

  const addTag = (tag: string) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addTag(input.trim());
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            <Tag className="h-3 w-3" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="border-0 flex-1 min-w-[120px] shadow-none focus-visible:ring-0 p-0 h-6"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="border rounded-md bg-popover shadow-md max-h-[200px] overflow-y-auto">
          {suggestions.slice(0, 10).map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center justify-between"
            >
              <span className="text-sm">{tag}</span>
              <Badge variant="outline" className="text-xs">
                {count}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
