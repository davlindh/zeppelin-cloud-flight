import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TagStats {
  tag: string;
  count: number;
}

export const useMediaTags = () => {
  // Fetch all unique tags with counts
  const { data: tags, isLoading } = useQuery({
    queryKey: ['media-tags'],
    queryFn: async (): Promise<TagStats[]> => {
      const { data, error } = await supabase
        .from('media_library')
        .select('tags');

      if (error) throw error;

      // Flatten and count tags
      const tagCounts: Record<string, number> = {};
      data?.forEach((item: any) => {
        item.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getPopularTags = (limit = 10) => {
    return tags?.slice(0, limit) || [];
  };

  const searchTags = (query: string) => {
    if (!query) return tags || [];
    return tags?.filter(t => 
      t.tag.toLowerCase().includes(query.toLowerCase())
    ) || [];
  };

  return {
    tags: tags || [],
    isLoading,
    getPopularTags,
    searchTags,
  };
};
