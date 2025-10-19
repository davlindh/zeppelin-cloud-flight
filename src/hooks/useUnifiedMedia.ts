import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MediaLibraryItem, MediaFilters, MediaType } from '@/types/mediaLibrary';

export const useUnifiedMedia = (initialFilters?: MediaFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MediaFilters>(initialFilters || {});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Fetch media items
  const { data: media = [], isLoading, error } = useQuery({
    queryKey: ['unified-media', filters],
    queryFn: async () => {
      // Handle project/participant filtering through link tables
      if (filters.project_id) {
        const { data: links } = await supabase
          .from('media_project_links')
          .select('media_id')
          .eq('project_id', filters.project_id);
        
        if (!links || links.length === 0) return [];
        
        const mediaIds = links.map(link => link.media_id);
        let query = supabase
          .from('media_library')
          .select('*')
          .in('id', mediaIds)
          .order('created_at', { ascending: false });
        
        // Apply additional filters
        if (filters.type && !Array.isArray(filters.type)) {
          query = query.eq('type', filters.type);
        } else if (filters.type && Array.isArray(filters.type)) {
          query = query.in('type', filters.type);
        }
        if (filters.status && !Array.isArray(filters.status)) {
          query = query.eq('status', filters.status);
        } else if (filters.status && Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        }
        if (filters.is_public !== undefined) {
          query = query.eq('is_public', filters.is_public);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data as MediaLibraryItem[];
      }
      
      if (filters.participant_id) {
        const { data: links } = await supabase
          .from('media_participant_links')
          .select('media_id')
          .eq('participant_id', filters.participant_id);
        
        if (!links || links.length === 0) return [];
        
        const mediaIds = links.map(link => link.media_id);
        let query = supabase
          .from('media_library')
          .select('*')
          .in('id', mediaIds)
          .order('created_at', { ascending: false });
        
        // Apply additional filters
        if (filters.type && !Array.isArray(filters.type)) {
          query = query.eq('type', filters.type);
        } else if (filters.type && Array.isArray(filters.type)) {
          query = query.in('type', filters.type);
        }
        if (filters.status && !Array.isArray(filters.status)) {
          query = query.eq('status', filters.status);
        } else if (filters.status && Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        }
        if (filters.is_public !== undefined) {
          query = query.eq('is_public', filters.is_public);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return data as MediaLibraryItem[];
      }
      
      // Default query without project/participant filtering
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type && !Array.isArray(filters.type)) {
        query = query.eq('type', filters.type);
      } else if (filters.type && Array.isArray(filters.type)) {
        query = query.in('type', filters.type);
      }
      if (filters.status && !Array.isArray(filters.status)) {
        query = query.eq('status', filters.status);
      } else if (filters.status && Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      }
      if (filters.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }
      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,filename.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as MediaLibraryItem[];
    },
  });

  // Selection management
  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => [...prev, id]);
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.filter(i => i !== id));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(media.map(item => item.id));
  }, [media]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Filter management
  const updateFilters = useCallback((newFilters: Partial<MediaFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const searchItems = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  // Get selected items
  const getSelectedItems = useCallback(() => {
    return media.filter(item => selectedItems.includes(item.id));
  }, [media, selectedItems]);

  // Stats
  const stats = useMemo(() => {
    const typeStats = media.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<MediaType, number>);

    const statusStats = media.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: media.length,
      selected: selectedItems.length,
      ...typeStats,
      ...statusStats,
      public: media.filter(item => item.is_public).length,
      private: media.filter(item => !item.is_public).length,
      featured: media.filter(item => item.is_featured).length,
    };
  }, [media, selectedItems.length]);

  return {
    // Data
    media,
    isLoading,
    error,
    
    // Filters
    filters,
    updateFilters,
    clearFilters,
    searchItems,
    
    // Selection
    selectedItems,
    selectItem,
    deselectItem,
    toggleSelection,
    selectAll,
    clearSelection,
    getSelectedItems,
    
    // Stats
    stats,
  };
};
