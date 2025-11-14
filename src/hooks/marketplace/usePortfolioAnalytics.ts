import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PortfolioAnalytics {
  itemId: string;
  title: string;
  views: number;
  clicks: number;
  conversions: number;
  clickRate: number; // clicks / views * 100
  conversionRate: number; // conversions / clicks * 100
  recentViews: number; // Last 7 days
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  avgClickRate: number;
  avgConversionRate: number;
  topPerformingItems: PortfolioAnalytics[];
}

export const usePortfolioAnalytics = (providerId: string, dateRange: number = 30) => {
  return useQuery({
    queryKey: ['portfolio-analytics', providerId, dateRange],
    queryFn: async () => {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - dateRange);

      // Get portfolio items with analytics
      const { data: items, error: itemsError } = await supabase
        .from('service_portfolio_items')
        .select('id, title')
        .eq('provider_id', providerId);

      if (itemsError) throw itemsError;

      const analytics: PortfolioAnalytics[] = [];

      for (const item of items || []) {
      // Get views count
      const { count: views } = await (supabase as any)
        .from('portfolio_item_views')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_item_id', item.id)
        .gte('created_at', dateFrom.toISOString());

      // Get recent views (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: recentViews } = await (supabase as any)
        .from('portfolio_item_views')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_item_id', item.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get clicks count
      const { count: clicks } = await (supabase as any)
        .from('portfolio_item_clicks')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_item_id', item.id)
        .gte('created_at', dateFrom.toISOString());

      // Get conversions count
      const { count: conversions } = await (supabase as any)
        .from('portfolio_conversions')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_item_id', item.id)
        .gte('created_at', dateFrom.toISOString());

      const clickRate = views ? ((clicks || 0) / views) * 100 : 0;
      const conversionRate = clicks ? ((conversions || 0) / (clicks || 1)) * 100 : 0;

      // Determine trend (comparing recent vs older views)
      const olderDate = new Date();
      olderDate.setDate(olderDate.getDate() - 14);
      const { count: olderViews } = await (supabase as any)
        .from('portfolio_item_views')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_item_id', item.id)
        .gte('created_at', olderDate.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if ((recentViews || 0) > (olderViews || 0) * 1.2) trend = 'up';
        else if ((recentViews || 0) < (olderViews || 0) * 0.8) trend = 'down';

        analytics.push({
          itemId: item.id,
          title: item.title,
          views: views || 0,
          clicks: clicks || 0,
          conversions: conversions || 0,
          clickRate,
          conversionRate,
          recentViews: recentViews || 0,
          trend
        });
      }

      // Calculate summary
      const totalViews = analytics.reduce((sum, a) => sum + a.views, 0);
      const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);
      const totalConversions = analytics.reduce((sum, a) => sum + a.conversions, 0);

      const summary: AnalyticsSummary = {
        totalViews,
        totalClicks,
        totalConversions,
        avgClickRate: totalViews ? (totalClicks / totalViews) * 100 : 0,
        avgConversionRate: totalClicks ? (totalConversions / totalClicks) * 100 : 0,
        topPerformingItems: analytics
          .sort((a, b) => b.conversions - a.conversions)
          .slice(0, 5)
      };

      return { analytics, summary };
    },
    enabled: !!providerId
  });
};

export const useTrackPortfolioView = () => {
  return useMutation({
    mutationFn: async ({ itemId, providerId, sessionId }: { 
      itemId: string; 
      providerId: string;
      sessionId?: string;
    }) => {
      const { error } = await (supabase as any)
        .from('portfolio_item_views')
        .insert({
          portfolio_item_id: itemId,
          provider_id: providerId,
          session_id: sessionId || crypto.randomUUID(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });

      if (error) throw error;
    }
  });
};

export const useTrackPortfolioClick = () => {
  return useMutation({
    mutationFn: async ({ 
      itemId, 
      providerId, 
      clickType,
      sessionId 
    }: { 
      itemId: string; 
      providerId: string;
      clickType: 'detail_view' | 'project_url' | 'contact' | 'image';
      sessionId?: string;
    }) => {
      const { error } = await (supabase as any)
        .from('portfolio_item_clicks')
        .insert({
          portfolio_item_id: itemId,
          provider_id: providerId,
          click_type: clickType,
          session_id: sessionId || crypto.randomUUID()
        });

      if (error) throw error;
    }
  });
};

export const useTrackConversion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      providerId, 
      conversionType,
      itemId,
      relatedId,
      customerEmail
    }: { 
      providerId: string;
      conversionType: 'inquiry' | 'booking' | 'review';
      itemId?: string;
      relatedId?: string;
      customerEmail?: string;
    }) => {
      const { error } = await (supabase as any)
        .from('portfolio_conversions')
        .insert({
          portfolio_item_id: itemId || null,
          provider_id: providerId,
          conversion_type: conversionType,
          related_id: relatedId || null,
          customer_email: customerEmail || null
        });

      if (error) throw error;

      // Also send email notification
      try {
        await supabase.functions.invoke('send-provider-notification', {
          body: {
            providerId,
            type: conversionType === 'inquiry' ? 'inquiry' : conversionType,
            data: {
              customerEmail
            }
          }
        });
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the conversion tracking if notification fails
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-analytics'] });
    }
  });
};
