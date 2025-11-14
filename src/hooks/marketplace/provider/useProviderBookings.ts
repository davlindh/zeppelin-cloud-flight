import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProviderBookings = (providerId: string, days: number = 7) => {
  return useQuery({
    queryKey: ['provider-bookings', providerId, days],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + days);
      
      // Fetch bookings for next N days
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*, services!inner(provider_id, title, image)')
        .eq('services.provider_id', providerId)
        .gte('selected_date', today.toISOString().split('T')[0])
        .lte('selected_date', endDate.toISOString().split('T')[0])
        .order('selected_date', { ascending: true })
        .order('selected_time', { ascending: true });
      
      if (error) throw error;
      
      // Group bookings by date
      const bookingsByDate = (bookings || []).reduce((acc, booking) => {
        const date = booking.selected_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(booking);
        return acc;
      }, {} as Record<string, typeof bookings>);
      
      // Generate calendar days
      const calendarDays = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayBookings = bookingsByDate[dateStr] || [];
        
        calendarDays.push({
          date: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate(),
          bookings: dayBookings,
          bookingCount: dayBookings.length,
          hasConfirmed: dayBookings.some(b => b.status === 'confirmed'),
          hasPending: dayBookings.some(b => b.status === 'pending'),
        });
      }
      
      // Find next upcoming booking
      const upcomingBookings = bookings?.filter(b => 
        b.status === 'confirmed' || b.status === 'pending'
      ) || [];
      
      const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;
      
      return {
        calendarDays,
        nextBooking,
        totalUpcoming: upcomingBookings.length,
      };
    },
    enabled: !!providerId,
    staleTime: 60000, // 1 minute
  });
};
