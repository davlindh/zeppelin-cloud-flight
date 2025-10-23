import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MediaLibraryItem, MediaFilters, MediaType } from '@/types/mediaLibrary';

export const useMedia = (initialFilters?: MediaFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MediaFilters>(initialFilters || {});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Helper function to apply common filters
  const applyFilters = (query: any) => {
    // Type filter
    if (filters.type && !Array.isArray(filters.type)) {
      query = query.eq('type', filters.type);
    } else if (filters.type && Array.isArray(filters.type)) {
      query = query.in('type', filters.type);
    }
    
    // Status filter
    if (filters.status && !Array.isArray(filters.status)) {
      query = query.eq('status', filters.status);
    } else if (filters.status && Array.isArray(filters.status)) {
      query = query.in('status', filters.status);
    }
    
    // Boolean filters
    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    
    // Search filter
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,filename.ilike.%${filters.search}%`);
    }
    
    // Date range filters
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    
    // File size filters
    if (filters.file_size_min !== undefined) {
      query = query.gte('file_size', filters.file_size_min);
    }
    if (filters.file_size_max !== undefined) {
      query = query.lte('file_size', filters.file_size_max);
    }
    
    return query;
  };

  // Fetch media items
  const { data: media = [], isLoading, error } = useQuery<MediaLibraryItem[]>({
    queryKey: ['unified-media', filters],
    queryFn: async (): Promise<MediaLibraryItem[]> => {
      // Handle project filtering (both direct and via links)
      if (filters.project_id) {
        // Get media linked via media_project_links
        const { data: links } = await supabase
          .from('media_project_links')
          .select('media_id')
          .eq('project_id', filters.project_id);
        
        const linkedMediaIds = links?.map(link => link.media_id) || [];
        
        // Get media with direct project_id
        let directQuery = supabase
          .from('media_library')
          .select('*')
          .eq('project_id', filters.project_id);
        
        directQuery = applyFilters(directQuery);
        const { data: directMedia, error: directError } = await directQuery;
        if (directError) throw directError;
        
        // Get media via links if any exist
        let linkedMedia: MediaLibraryItem[] = [];
        if (linkedMediaIds.length > 0) {
          let linkedQuery = supabase
            .from('media_library')
            .select('*')
            .in('id', linkedMediaIds);
          
          linkedQuery = applyFilters(linkedQuery);
          const { data, error } = await linkedQuery;
          if (error) throw error;
          linkedMedia = data as MediaLibraryItem[];
        }
        
        // Combine and deduplicate by id
        const allMedia = [...(directMedia || []), ...linkedMedia];
        const uniqueMedia = Array.from(
          new Map(allMedia.map(item => [item.id, item])).values()
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // FALLBACK: Fetch from OLD project_media table
        const { data: legacyMedia } = await supabase
          .from('project_media')
          .select('*')
          .eq('project_id', filters.project_id);
        
        // Transform legacy media to MediaLibraryItem format
        const transformedLegacy: MediaLibraryItem[] = (legacyMedia || []).map(pm => {
          // Fix URL construction - ensure proper Supabase URL format
          const fixedUrl = pm.url.startsWith('http')
            ? pm.url
            : `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/media-files/media/${pm.url}`;

          return {
            id: `legacy-${pm.id}`,
            type: pm.type as MediaLibraryItem['type'],
            title: pm.title,
            description: pm.description || null,
            filename: pm.url.split('/').pop() || pm.title,
            original_filename: pm.title,
            public_url: fixedUrl,
            storage_path: pm.url,
            thumbnail_url: pm.thumbnail_url,
            mime_type: pm.type === 'video' ? 'video/mp4' : pm.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
            status: 'approved' as MediaLibraryItem['status'],
            source: 'legacy_project_media' as MediaLibraryItem['source'],
            bucket: 'media-files',
            is_public: true,
            is_featured: false,
            uploaded_at: pm.created_at,
            approved_at: pm.created_at,
            created_at: pm.created_at,
            updated_at: pm.created_at,
            project_id: pm.project_id,
            participant_id: null,
            submission_id: null,
            uploaded_by: null,
            tags: [],
            category: null,
            file_size: null,
            width: null,
            height: null,
            duration: null,
            is_legacy: true,
          };
        });
        
        // Merge with new media and deduplicate by public_url
        const allMediaWithLegacy = [...uniqueMedia, ...transformedLegacy];
        const deduplicatedMedia = Array.from(
          new Map(allMediaWithLegacy.map(item => [item.public_url, item])).values()
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as MediaLibraryItem[];
        
        return deduplicatedMedia;
      }
      
      // Handle participant filtering (both direct and via links)
      if (filters.participant_id) {
        // Get media linked via media_participant_links
        const { data: links } = await supabase
          .from('media_participant_links')
          .select('media_id')
          .eq('participant_id', filters.participant_id);
        
        const linkedMediaIds = links?.map(link => link.media_id) || [];
        
        // Get media with direct participant_id
        let directQuery = supabase
          .from('media_library')
          .select('*')
          .eq('participant_id', filters.participant_id);
        
        directQuery = applyFilters(directQuery);
        const { data: directMedia, error: directError } = await directQuery;
        if (directError) throw directError;
        
        // Get media via links if any exist
        let linkedMedia: MediaLibraryItem[] = [];
        if (linkedMediaIds.length > 0) {
          let linkedQuery = supabase
            .from('media_library')
            .select('*')
            .in('id', linkedMediaIds);
          
          linkedQuery = applyFilters(linkedQuery);
          const { data, error } = await linkedQuery;
          if (error) throw error;
          linkedMedia = data as MediaLibraryItem[];
        }
        
        // Combine and deduplicate by id
        const allMedia = [...(directMedia || []), ...linkedMedia];
        const uniqueMedia = Array.from(
          new Map(allMedia.map(item => [item.id, item])).values()
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // FALLBACK: Fetch from OLD participant_media table
        const { data: legacyMedia } = await supabase
          .from('participant_media')
          .select('*')
          .eq('participant_id', filters.participant_id);
        
        // Transform legacy media to MediaLibraryItem format
        const transformedLegacy: MediaLibraryItem[] = (legacyMedia || []).map(pm => {
          // Fix URL construction - ensure proper Supabase URL format
          const fixedUrl = pm.url.startsWith('http')
            ? pm.url
            : `https://paywaomkmjssbtkzwnwd.supabase.co/storage/v1/object/public/media-files/media/${pm.url}`;

          return {
            id: `legacy-${pm.id}`,
            type: pm.type as MediaLibraryItem['type'],
            title: pm.title,
            description: pm.description || null,
            filename: pm.url.split('/').pop() || pm.title,
            original_filename: pm.title,
            public_url: fixedUrl,
            storage_path: pm.url,
            thumbnail_url: pm.thumbnail_url,
            mime_type: pm.type === 'video' ? 'video/mp4' : pm.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
            status: 'approved' as MediaLibraryItem['status'],
            source: 'legacy_participant_media' as MediaLibraryItem['source'],
            bucket: 'media-files',
            is_public: true,
            is_featured: false,
            uploaded_at: pm.created_at,
            approved_at: pm.created_at,
            created_at: pm.created_at,
            updated_at: pm.created_at,
            project_id: null,
            participant_id: pm.participant_id,
            submission_id: null,
            uploaded_by: null,
            tags: [],
            category: pm.category,
            file_size: null,
            width: null,
            height: null,
            duration: null,
            is_legacy: true,
          };
        });
        
        // Merge with new media and deduplicate by public_url
        const allMediaWithLegacy = [...uniqueMedia, ...transformedLegacy];
        const deduplicatedMedia = Array.from(
          new Map(allMediaWithLegacy.map(item => [item.public_url, item])).values()
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as MediaLibraryItem[];
        
        return deduplicatedMedia;
      }
      
      // Default query without project/participant filtering
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      query = applyFilters(query);

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
      legacy: media.filter(item => item.is_legacy === true).length,
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
