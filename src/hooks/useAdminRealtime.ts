import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface AdminRealtimeData {
  newCommunications: number
  newBookings: number
  newOrders: number
  newUsers: number
  recentActivity: Array<{
    id: string
    type: string
    message: string
    timestamp: string
  }>
}

export function useAdminRealtime() {
  const [data, setData] = useState<AdminRealtimeData>({
    newCommunications: 0,
    newBookings: 0,
    newOrders: 0,
    newUsers: 0,
    recentActivity: []
  })
  const { toast } = useToast()

  useEffect(() => {
    // Set up real-time listeners for admin-relevant events
    const communicationsChannel = supabase
      .channel('admin-communications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communication_requests'
        },
        (payload) => {
          setData(prev => ({
            ...prev,
            newCommunications: prev.newCommunications + 1,
            recentActivity: [
              {
                id: payload.new.id,
                type: 'communication',
                message: `New message from ${payload.new.customer_name}`,
                timestamp: new Date().toISOString()
              },
              ...prev.recentActivity.slice(0, 9) // Keep last 10
            ]
          }))
          
          toast({
            title: "New Communication",
            description: `Message received from ${payload.new.customer_name}`,
          })
        }
      )
      .subscribe()

    const bookingsChannel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          setData(prev => ({
            ...prev,
            newBookings: prev.newBookings + 1,
            recentActivity: [
              {
                id: payload.new.id,
                type: 'booking',
                message: `New booking by ${payload.new.customer_name}`,
                timestamp: new Date().toISOString()
              },
              ...prev.recentActivity.slice(0, 9)
            ]
          }))
          
          toast({
            title: "New Booking",
            description: `Service booked by ${payload.new.customer_name}`,
          })
        }
      )
      .subscribe()

    const ordersChannel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          setData(prev => ({
            ...prev,
            newOrders: prev.newOrders + 1,
            recentActivity: [
              {
                id: payload.new.id,
                type: 'order',
                message: `New order: ${payload.new.order_number}`,
                timestamp: new Date().toISOString()
              },
              ...prev.recentActivity.slice(0, 9)
            ]
          }))
          
          toast({
            title: "New Order",
            description: `Order placed: ${payload.new.order_number}`,
          })
        }
      )
      .subscribe()

    const usersChannel = supabase
      .channel('admin-users')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          setData(prev => ({
            ...prev,
            newUsers: prev.newUsers + 1,
            recentActivity: [
              {
                id: payload.new.id,
                type: 'user',
                message: `New user registered: ${payload.new.full_name || payload.new.email}`,
                timestamp: new Date().toISOString()
              },
              ...prev.recentActivity.slice(0, 9)
            ]
          }))
          
          toast({
            title: "New User",
            description: `User registered: ${payload.new.full_name || payload.new.email}`,
          })
        }
      )
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(communicationsChannel)
      supabase.removeChannel(bookingsChannel)
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(usersChannel)
    }
  }, [toast])

  const resetCount = (type: keyof Pick<AdminRealtimeData, 'newCommunications' | 'newBookings' | 'newOrders' | 'newUsers'>) => {
    setData(prev => ({
      ...prev,
      [type]: 0
    }))
  }

  return {
    data,
    resetCount
  }
}