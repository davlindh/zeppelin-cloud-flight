import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, subMonths, format } from 'date-fns';

interface MonthlySpending {
  month: string;
  amount: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

interface CustomerAnalytics {
  monthlySpending: MonthlySpending[];
  spendingByCategory: CategorySpending[];
  orderFrequency: { month: string; orders: number }[];
  averageOrderValue: number;
  totalLifetimeSpending: number;
  favoriteCategories: string[];
}

export const useCustomerAnalytics = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['customer-analytics', userId],
    queryFn: async (): Promise<CustomerAnalytics> => {
      if (!userId) throw new Error('User ID required');

      // Fetch orders from last 6 months
      const sixMonthsAgo = subMonths(startOfMonth(new Date()), 6);
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*, item_type)')
        .eq('user_id', userId)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate monthly spending
      const monthlyMap = new Map<string, number>();
      const orderCountMap = new Map<string, number>();
      let totalSpending = 0;

      orders?.forEach(order => {
        const month = format(new Date(order.created_at), 'MMM yyyy');
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + order.total_amount);
        orderCountMap.set(month, (orderCountMap.get(month) || 0) + 1);
        totalSpending += order.total_amount;
      });

      const monthlySpending: MonthlySpending[] = Array.from(monthlyMap.entries()).map(([month, amount]) => ({
        month,
        amount
      }));

      const orderFrequency = Array.from(orderCountMap.entries()).map(([month, orders]) => ({
        month,
        orders
      }));

      // Calculate spending by category (Products, Services, Auctions)
      const categoryMap = new Map<string, number>();
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const category = item.item_type === 'product' ? 'Products' : 
                          item.item_type === 'service' ? 'Services' : 'Auctions';
          categoryMap.set(category, (categoryMap.get(category) || 0) + item.total_price);
        });
      });

      const spendingByCategory: CategorySpending[] = Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
      }));

      // Get favorite categories from purchases
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('item_id, item_type')
        .in('order_id', orders?.map(o => o.id) || []);

      const productIds = orderItems?.filter(i => i.item_type === 'product').map(i => i.item_id) || [];
      
      const { data: products } = await supabase
        .from('products')
        .select('category_id, categories(name)')
        .in('id', productIds);

      const categoryCount = new Map<string, number>();
      products?.forEach((p: any) => {
        const catName = p.categories?.name;
        if (catName) categoryCount.set(catName, (categoryCount.get(catName) || 0) + 1);
      });

      const favoriteCategories = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

      return {
        monthlySpending,
        spendingByCategory,
        orderFrequency,
        averageOrderValue: orders && orders.length > 0 ? totalSpending / orders.length : 0,
        totalLifetimeSpending: totalSpending,
        favoriteCategories
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
