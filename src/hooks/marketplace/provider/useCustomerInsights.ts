import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCustomerInsights = (providerId: string) => {
  return useQuery({
    queryKey: ['customer-insights', providerId],
    queryFn: async () => {
      // Fetch all bookings for this provider
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('customer_email, customer_name, total_price, status, created_at, services!inner(provider_id)')
        .eq('services.provider_id', providerId)
        .in('status', ['confirmed', 'completed']);
      
      if (error) throw error;
      
      if (!bookings || bookings.length === 0) {
        return {
          topCustomers: [],
          repeatRate: 0,
          avgLifetimeValue: 0,
          totalCustomers: 0,
          newCustomers: 0,
          returningCustomers: 0,
        };
      }
      
      // Group bookings by customer email
      const customerData = bookings.reduce((acc, booking) => {
        const email = booking.customer_email;
        if (!acc[email]) {
          acc[email] = {
            email,
            name: booking.customer_name,
            bookings: [],
            totalSpent: 0,
          };
        }
        acc[email].bookings.push(booking);
        acc[email].totalSpent += booking.total_price || 0;
        return acc;
      }, {} as Record<string, { email: string; name: string; bookings: any[]; totalSpent: number }>);
      
      const customers = Object.values(customerData);
      
      // Top customers by total spent
      const topCustomers = customers
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          email: c.email,
          bookingCount: c.bookings.length,
          totalSpent: c.totalSpent,
        }));
      
      // Calculate repeat customer rate
      const repeatCustomers = customers.filter(c => c.bookings.length >= 2);
      const repeatRate = customers.length > 0 
        ? Math.round((repeatCustomers.length / customers.length) * 100)
        : 0;
      
      // Average lifetime value
      const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
      const avgLifetimeValue = customers.length > 0 
        ? totalRevenue / customers.length
        : 0;
      
      // New vs returning customers (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentBookings = bookings.filter(
        b => new Date(b.created_at) >= thirtyDaysAgo
      );
      
      const recentCustomerEmails = new Set(recentBookings.map(b => b.customer_email));
      const returningCustomers = Array.from(recentCustomerEmails).filter(
        email => customerData[email].bookings.some(
          b => new Date(b.created_at) < thirtyDaysAgo
        )
      ).length;
      
      const newCustomers = recentCustomerEmails.size - returningCustomers;
      
      return {
        topCustomers,
        repeatRate,
        avgLifetimeValue,
        totalCustomers: customers.length,
        newCustomers,
        returningCustomers,
      };
    },
    enabled: !!providerId,
    staleTime: 300000, // 5 minutes
  });
};
