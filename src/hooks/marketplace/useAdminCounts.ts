import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

interface AdminCounts {
  unreadMessages: number
  pendingBookings: number
  pendingOrders: number
  lowStockProducts: number
  endingAuctions: number
}

export function useAdminCounts() {
  const { data: counts = {
    unreadMessages: 0,
    pendingBookings: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    endingAuctions: 0
  } } = useQuery({
    queryKey: ['admin-counts'],
    queryFn: async (): Promise<AdminCounts> => {
      const [
        messagesRes,
        bookingsRes,
        ordersRes,
        productsRes,
        auctionsRes
      ] = await Promise.all([
        // Unread messages (last 24 hours without response)
        supabase
          .from('communication_requests')
          .select('id', { count: 'exact' })
          .eq('status', 'delivered')
          .is('provider_response', null)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        
        // Pending bookings
        supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),
        
        // Pending orders
        supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),
        
        // Low stock products (less than 10 units)
        supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('is_stock_item', true)
          .lt('stock_quantity', 10),
        
        // Auctions ending within 24 hours
        supabase
          .from('auctions')
          .select('id', { count: 'exact' })
          .lte('end_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
          .gte('end_time', new Date().toISOString())
      ])

      return {
        unreadMessages: messagesRes.count || 0,
        pendingBookings: bookingsRes.count || 0,
        pendingOrders: ordersRes.count || 0,
        lowStockProducts: productsRes.count || 0,
        endingAuctions: auctionsRes.count || 0
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  return counts
}