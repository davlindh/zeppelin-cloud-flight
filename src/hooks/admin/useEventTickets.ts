import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/unified";

export function useEventTickets(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-tickets", eventId],
    queryFn: async (): Promise<Product[]> => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("event_id", eventId)
        .eq("product_type", "event_ticket")
        .order("selling_price", { ascending: true });

      if (error) throw error;
      
      // Transform database format to Product type
      return (data ?? []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.selling_price,
        originalPrice: item.original_price ?? undefined,
        categoryId: item.category_id || '',
        categoryName: '',
        rating: item.rating || 0,
        reviews: item.reviews || 0,
        inStock: item.in_stock,
        image: item.image,
        images: item.images || [],
        variants: [],
        features: item.features || [],
        brand: item.product_brand || '',
        tags: item.tags || [],
        slug: item.slug,
        stock_quantity: item.stock_quantity,
        selling_price: item.selling_price,
      })) as any[];
    },
    enabled: !!eventId,
    staleTime: 30_000,
  });
}

interface TicketSalesStats {
  total_sold: number;
  total_revenue: number;
  average_price: number;
  by_ticket_type: Array<{
    ticket_id: string;
    ticket_title: string;
    sold: number;
    revenue: number;
    remaining: number;
  }>;
}

export function useTicketSalesStats(eventId: string | undefined) {
  return useQuery({
    queryKey: ["ticket-sales-stats", eventId],
    queryFn: async (): Promise<TicketSalesStats> => {
      if (!eventId) {
        return {
          total_sold: 0,
          total_revenue: 0,
          average_price: 0,
          by_ticket_type: [],
        };
      }

      // Get all tickets for this event
      const { data: tickets, error: ticketsError } = await supabase
        .from("products")
        .select("id, title, selling_price, stock_quantity, original_stock:stock_quantity")
        .eq("event_id", eventId)
        .eq("product_type", "event_ticket");

      if (ticketsError) throw ticketsError;

      // For each ticket, calculate sold quantity from orders
      const ticketStats = await Promise.all(
        (tickets || []).map(async (ticket) => {
          const { data: orderItems, error: orderError } = await supabase
            .from("order_items")
            .select("quantity, unit_price, order:orders!inner(status)")
            .eq("item_id", ticket.id)
            .eq("item_type", "product")
            .in("order.status", ["paid", "completed"]);

          if (orderError) throw orderError;

          const sold = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
          const revenue = orderItems?.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 0)), 0) || 0;

          return {
            ticket_id: ticket.id,
            ticket_title: ticket.title,
            sold,
            revenue,
            remaining: ticket.stock_quantity,
          };
        })
      );

      const total_sold = ticketStats.reduce((sum, t) => sum + t.sold, 0);
      const total_revenue = ticketStats.reduce((sum, t) => sum + t.revenue, 0);
      const average_price = total_sold > 0 ? total_revenue / total_sold : 0;

      return {
        total_sold,
        total_revenue,
        average_price,
        by_ticket_type: ticketStats,
      };
    },
    enabled: !!eventId,
    staleTime: 60_000,
  });
}
