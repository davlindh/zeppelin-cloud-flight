import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './shared/useDebounce';

export type SearchResultType = 'product' | 'service' | 'auction' | 'order' | 'booking';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  status?: string;
  link: string;
}

export const useGlobalSearch = (query: string, enabled: boolean = true) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const results: SearchResult[] = [];
      const searchTerm = debouncedQuery.toLowerCase();

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, title, description, image, selling_price')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(5);

      if (products) {
        results.push(...products.map(p => ({
          id: p.id,
          type: 'product' as SearchResultType,
          title: p.title,
          description: p.description,
          image: p.image || undefined,
          price: p.selling_price,
          link: `/marketplace/shop/${p.id}`
        })));
      }

      // Search services
      const { data: services } = await supabase
        .from('services')
        .select('id, title, description, image')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(5);

      if (services) {
        results.push(...services.map(s => ({
          id: s.id,
          type: 'service' as SearchResultType,
          title: s.title,
          description: s.description || undefined,
          image: s.image || undefined,
          link: `/marketplace/services/${s.id}`
        })));
      }

      // Search auctions
      const { data: auctions } = await supabase
        .from('auctions')
        .select('id, title, description, image, current_bid, status')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .limit(5);

      if (auctions) {
        results.push(...auctions.map(a => ({
          id: a.id,
          type: 'auction' as SearchResultType,
          title: a.title,
          description: a.description || undefined,
          image: a.image || undefined,
          price: a.current_bid,
          status: a.status || undefined,
          link: `/marketplace/auctions/${a.id}`
        })));
      }

      // Search orders (by order number)
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, total_amount, status')
        .ilike('order_number', `%${searchTerm}%`)
        .limit(3);

      if (orders) {
        results.push(...orders.map(o => ({
          id: o.id,
          type: 'order' as SearchResultType,
          title: `Order #${o.order_number}`,
          description: `${o.customer_name} - ${o.status}`,
          price: o.total_amount,
          status: o.status,
          link: `/marketplace/orders/${o.id}`
        })));
      }

      return results;
    },
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 30 * 1000 // 30 seconds
  });
};
