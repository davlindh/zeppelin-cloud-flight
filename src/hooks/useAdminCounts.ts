import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

interface AdminCounts {
  unreadMessages: number
  pendingBookings: number
  pendingOrders: number
  lowStockProducts: number
  endingAuctions: number
  pendingRegistrations: number
  upcomingEvents: number
  lowStockTickets: number
  activeCampaigns: number
  draftCampaigns: number
  endingCampaigns: number
}

export function useAdminCounts() {
  const { data: counts = {
    unreadMessages: 0,
    pendingBookings: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    endingAuctions: 0,
    pendingRegistrations: 0,
    upcomingEvents: 0,
    lowStockTickets: 0,
    activeCampaigns: 0,
    draftCampaigns: 0,
    endingCampaigns: 0
  } } = useQuery({
    queryKey: ['admin-counts'],
    queryFn: async (): Promise<AdminCounts> => {
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      
      const [
        messagesRes,
        bookingsRes,
        ordersRes,
        productsRes,
        auctionsRes,
        registrationsRes,
        upcomingEventsRes,
        ticketsRes,
        activeCampaignsRes,
        draftCampaignsRes,
        endingCampaignsRes
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
          .gte('end_time', new Date().toISOString()),
        
        // Pending event registrations
        supabase
          .from('event_registrations')
          .select('id', { count: 'exact' })
          .eq('status', 'pending'),
        
        // Upcoming events (next 7 days)
        supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString())
          .lte('starts_at', sevenDaysFromNow),
        
        // Low stock event tickets
        supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('product_type', 'event_ticket')
          .not('event_id', 'is', null)
          .lt('stock_quantity', 10),
        
        // Active campaigns
        supabase
          .from('funding_campaigns')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        
        // Draft campaigns
        supabase
          .from('funding_campaigns')
          .select('id', { count: 'exact' })
          .eq('status', 'draft'),
        
        // Campaigns ending soon (within 7 days)
        supabase
          .from('funding_campaigns')
          .select('id', { count: 'exact' })
          .eq('status', 'active')
          .not('deadline', 'is', null)
          .gte('deadline', new Date().toISOString())
          .lte('deadline', sevenDaysFromNow)
      ])

      return {
        unreadMessages: messagesRes.count || 0,
        pendingBookings: bookingsRes.count || 0,
        pendingOrders: ordersRes.count || 0,
        lowStockProducts: productsRes.count || 0,
        endingAuctions: auctionsRes.count || 0,
        pendingRegistrations: registrationsRes.count || 0,
        upcomingEvents: upcomingEventsRes.count || 0,
        lowStockTickets: ticketsRes.count || 0,
        activeCampaigns: activeCampaignsRes.count || 0,
        draftCampaigns: draftCampaignsRes.count || 0,
        endingCampaigns: endingCampaignsRes.count || 0
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  return counts
}