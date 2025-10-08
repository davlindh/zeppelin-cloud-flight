import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UseOrdersOptions {
  customerEmail?: string;
  status?: string;
  limit?: number;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const { customerEmail, status, limit } = options;

  return useQuery({
    queryKey: ['orders', customerEmail, status, limit],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (title, image),
            auctions (title, image),
            services (title)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (customerEmail) {
        query = query.eq('customer_email', customerEmail);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};
