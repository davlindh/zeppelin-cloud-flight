import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SellerRevenueSummary } from '@/types/commerce';

interface UseSellerRevenueOptions {
  dateFrom?: string;
  dateTo?: string;
}

export const useSellerRevenue = (options: UseSellerRevenueOptions = {}) => {
  return useQuery({
    queryKey: ['seller-revenue', options],
    queryFn: async () => {
      // Get current user's provider profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: provider } = await supabase
        .from('service_providers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!provider) throw new Error('Provider profile not found');

      // Build query
      let query = supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(
            id,
            order_number,
            status,
            created_at,
            event_id,
            events(id, title)
          ),
          products(id, title)
        `)
        .eq('seller_id', provider.id);

      if (options.dateFrom) {
        query = query.gte('orders.created_at', options.dateFrom);
      }

      if (options.dateTo) {
        query = query.lte('orders.created_at', options.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate summary
      const items = data || [];
      const totalRevenue = items.reduce((sum, item) => sum + Number(item.total_price), 0);
      const totalCommission = items.reduce((sum, item) => sum + Number(item.commission_amount), 0);
      const netPayout = totalRevenue - totalCommission;
      const orderCount = new Set(items.map(item => item.order_id)).size;
      const itemsSold = items.reduce((sum, item) => sum + item.quantity, 0);

      // Calculate pending vs paid payout
      const pendingItems = items.filter((item: any) => 
        ['pending', 'paid', 'processing'].includes(item.orders.status)
      );
      const completedItems = items.filter((item: any) => 
        item.orders.status === 'delivered'
      );
      const pendingPayout = pendingItems.reduce((sum, item) => 
        sum + (Number(item.total_price) - Number(item.commission_amount)), 0
      );
      const paidOut = completedItems.reduce((sum, item) => 
        sum + (Number(item.total_price) - Number(item.commission_amount)), 0
      );

      // Top products
      const productRevenue = new Map<string, { title: string; revenue: number; count: number }>();
      items.forEach((item: any) => {
        const key = item.item_id;
        const existing = productRevenue.get(key) || { 
          title: item.products?.title || item.item_title, 
          revenue: 0, 
          count: 0 
        };
        productRevenue.set(key, {
          title: existing.title,
          revenue: existing.revenue + Number(item.total_price),
          count: existing.count + item.quantity,
        });
      });

      const topProducts = Array.from(productRevenue.entries())
        .map(([id, data]) => ({
          productId: id,
          productTitle: data.title,
          revenue: data.revenue,
          itemsSold: data.count,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Revenue by event
      const eventRevenue = new Map<string, { title: string; revenue: number; count: number }>();
      items.forEach((item: any) => {
        if (item.orders.event_id) {
          const key = item.orders.event_id;
          const existing = eventRevenue.get(key) || { 
            title: item.orders.events?.title || 'Unknown Event', 
            revenue: 0, 
            count: 0 
          };
          eventRevenue.set(key, {
            title: existing.title,
            revenue: existing.revenue + Number(item.total_price),
            count: existing.count + 1,
          });
        }
      });

      const revenueByEvent = Array.from(eventRevenue.entries())
        .map(([id, data]) => ({
          eventId: id,
          eventTitle: data.title,
          revenue: data.revenue,
          orderCount: data.count,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      // Revenue over time (last 30 days)
      const revenueByDate = new Map<string, { revenue: number; commission: number }>();
      items.forEach((item: any) => {
        const date = new Date(item.orders.created_at).toISOString().split('T')[0];
        const existing = revenueByDate.get(date) || { revenue: 0, commission: 0 };
        revenueByDate.set(date, {
          revenue: existing.revenue + Number(item.total_price),
          commission: existing.commission + Number(item.commission_amount),
        });
      });

      const revenueOverTime = Array.from(revenueByDate.entries())
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          commission: data.commission,
          netPayout: data.revenue - data.commission,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const summary: SellerRevenueSummary = {
        totalRevenue,
        totalCommission,
        netPayout,
        orderCount,
        itemsSold,
        averageOrderValue: orderCount > 0 ? totalRevenue / orderCount : 0,
        pendingPayout,
        paidOut,
        topProducts,
        revenueByEvent,
        revenueOverTime,
      };

      return summary;
    },
  });
};
