import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
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
import { X, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { MediaFilters, MediaType, MediaStatus } from '@/types/mediaLibrary';
import type { DateRange } from 'react-day-picker';

interface MediaFilterPanelProps {
  filters: MediaFilters;
  onChange: (filters: MediaFilters) => void;
  onClose?: () => void;
  showAdvanced?: boolean;
}

export const MediaFilterPanel: React.FC<MediaFilterPanelProps> = ({
  filters,
  onChange,
  onClose,
  showAdvanced = true,
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: filters.date_from ? new Date(filters.date_from) : undefined,
    to: filters.date_to ? new Date(filters.date_to) : undefined,
  });
  
  const [fileSizeRange, setFileSizeRange] = useState<[number, number]>([
    filters.file_size_min ? Math.round(filters.file_size_min / (1024 * 1024)) : 0,
    filters.file_size_max ? Math.round(filters.file_size_max / (1024 * 1024)) : 100,
  ]);

  // Fetch projects for filter
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .order('title');
      if (error) throw error;
      return data;
    },
    enabled: showAdvanced,
  });

  // Fetch participants for filter
  const { data: participants = [] } = useQuery({
    queryKey: ['participants-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: showAdvanced,
  });

  const handleFilterChange = (key: keyof MediaFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof MediaFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  const clearAllFilters = () => {
    onChange({});
    setDateRange(undefined);
    setFileSizeRange([0, 100]);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      handleFilterChange('date_from', range.from.toISOString());
    } else {
      clearFilter('date_from');
    }
    if (range?.to) {
      handleFilterChange('date_to', range.to.toISOString());
    } else {
      clearFilter('date_to');
    }
  };

  const handleFileSizeChange = (value: [number, number]) => {
    setFileSizeRange(value);
    handleFilterChange('file_size_min', value[0] * 1024 * 1024);
    handleFilterChange('file_size_max', value[1] * 1024 * 1024);
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            let displayValue = '';
            if (key === 'date_from' || key === 'date_to') {
              displayValue = format(new Date(value as string), 'PP', { locale: sv });
            } else if (key === 'file_size_min' || key === 'file_size_max') {
              displayValue = `${Math.round((value as number) / (1024 * 1024))} MB`;
            } else {
              displayValue = Array.isArray(value) ? value.join(', ') : String(value);
            }
            
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                <span className="text-xs">
                  {key}: {displayValue}
                </span>
                <button
                  onClick={() => clearFilter(key as keyof MediaFilters)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs"
          >
            Rensa alla
          </Button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="space-y-3">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm">Sök</Label>
          <Input
            id="search"
            placeholder="Titel, beskrivning, filnamn..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          />
        </div>

        {/* Type */}
        <div>
          <Label htmlFor="type" className="text-sm">Typ</Label>
          <Select
            value={filters.type as string || 'all'}
            onValueChange={(value) =>
              handleFilterChange('type', value === 'all' ? undefined : value as MediaType)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Alla typer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla typer</SelectItem>
              <SelectItem value="image">Bilder</SelectItem>
              <SelectItem value="video">Videor</SelectItem>
              <SelectItem value="audio">Ljud</SelectItem>
              <SelectItem value="document">Dokument</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status" className="text-sm">Status</Label>
          <Select
            value={filters.status as string || 'all'}
            onValueChange={(value) =>
              handleFilterChange('status', value === 'all' ? undefined : value as MediaStatus)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Alla statusar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla statusar</SelectItem>
              <SelectItem value="pending">Väntande</SelectItem>
              <SelectItem value="approved">Godkänd</SelectItem>
              <SelectItem value="rejected">Avvisad</SelectItem>
              <SelectItem value="archived">Arkiverad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showAdvanced && (
          <>
            {/* Date Range */}
            <div>
              <Label className="text-sm">Uppladdningsdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "PPP", { locale: sv })} -{" "}
                          {format(dateRange.to, "PPP", { locale: sv })}
                        </>
                      ) : (
                        format(dateRange.from, "PPP", { locale: sv })
                      )
                    ) : (
                      <span>Välj datumintervall</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    locale={sv}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* File Size Range */}
            <div>
              <Label className="text-sm">
                Filstorlek: {fileSizeRange[0]} MB - {fileSizeRange[1]} MB
              </Label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={fileSizeRange}
                onValueChange={(value) => handleFileSizeChange(value as [number, number])}
                className="mt-2"
              />
            </div>

            {/* Project Filter */}
            <div>
              <Label htmlFor="project" className="text-sm">Projekt</Label>
              <Select
                value={filters.project_id || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('project_id', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alla projekt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla projekt</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Participant Filter */}
            <div>
              <Label htmlFor="participant" className="text-sm">Deltagare</Label>
              <Select
                value={filters.participant_id || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('participant_id', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alla deltagare" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla deltagare</SelectItem>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Featured */}
        <div>
          <Label htmlFor="featured" className="text-sm">Utvald</Label>
          <Select
            value={
              filters.is_featured === undefined
                ? 'all'
                : filters.is_featured
                ? 'yes'
                : 'no'
            }
            onValueChange={(value) =>
              handleFilterChange(
                'is_featured',
                value === 'all' ? undefined : value === 'yes'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Alla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="yes">Endast utvalda</SelectItem>
              <SelectItem value="no">Ej utvalda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Public */}
        <div>
          <Label htmlFor="public" className="text-sm">Synlighet</Label>
          <Select
            value={
              filters.is_public === undefined
                ? 'all'
                : filters.is_public
                ? 'public'
                : 'private'
            }
            onValueChange={(value) =>
              handleFilterChange(
                'is_public',
                value === 'all' ? undefined : value === 'public'
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Alla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla</SelectItem>
              <SelectItem value="public">Offentlig</SelectItem>
              <SelectItem value="private">Privat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};