import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActivityItem } from '@/types/dashboard';
import { Calendar, Star, Eye, Package } from 'lucide-react';

export const useProviderActivity = (providerId: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['provider-activity', providerId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_activities')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Transform to ActivityItem[]
      return (data || []).map(activity => ({
        id: activity.id,
        action: activity.title,
        description: activity.description,
        created_at: activity.created_at,
        severity: activity.severity as 'high' | 'medium' | 'low',
        icon: getIconForActivityType(activity.activity_type),
        link: activity.link,
        metadata: activity.metadata,
      })) as ActivityItem[];
    },
    enabled: !!providerId,
    staleTime: 60000, // 1 minute
  });
};

function getIconForActivityType(type: string) {
  const iconMap: Record<string, any> = {
    booking_request: Calendar,
    review_received: Star,
    service_viewed: Eye,
    service_created: Package,
  };
  return iconMap[type] || Calendar;
}
