import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BookingExtended } from '@/types/services';
import { BookingActionModal } from '@/components/provider/BookingActionModal';
import { useServiceProviders } from '@/hooks/useServiceProviders';
import { format } from 'date-fns';

export const BookingsManagementPage = () => {
  const [selectedBooking, setSelectedBooking] = useState<BookingExtended | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'propose' | null>(null);

  // Get current provider
  const { data: currentProvider } = useQuery({
    queryKey: ['current-provider'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching current provider:', error);
        return null;
      }

      return data;
    },
  });

  // Get bookings for provider's services
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['provider-bookings', currentProvider?.id],
    queryFn: async (): Promise<BookingExtended[]> => {
      if (!currentProvider) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            title,
            starting_price,
            duration,
            provider,
            provider_id
          )
        `)
        .eq('services.provider_id', currentProvider.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any;
    },
    enabled: !!currentProvider,
  });

  const handleAction = (booking: BookingExtended, action: 'accept' | 'reject' | 'propose') => {
    setSelectedBooking(booking);
    setActionType(action);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      request: 'outline',
      pending: 'secondary',
      pending_provider: 'secondary',
      confirmed: 'default',
      completed: 'default',
      cancelled: 'destructive',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const filterBookings = (status?: string[]) => {
    if (!bookings) return [];
    if (!status) return bookings;
    return bookings.filter(b => status.includes(b.status));
  };

  const BookingCard = ({ booking }: { booking: BookingExtended }) => (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{booking.service?.title}</h3>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-sm text-muted-foreground">
              Booking #{booking.id.slice(0, 8)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer_phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{booking.selected_date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{booking.selected_time}</span>
          </div>
        </div>

        {booking.customer_message && (
          <div className="flex gap-2 p-3 bg-muted rounded-lg">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm">{booking.customer_message}</p>
          </div>
        )}

        {booking.provider_notes && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium mb-1">Your Notes:</p>
            <p className="text-sm text-muted-foreground">{booking.provider_notes}</p>
          </div>
        )}

        {(booking.status === 'request' || booking.status === 'pending_provider') && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => handleAction(booking, 'accept')}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction(booking, 'propose')}
            >
              Propose Time
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction(booking, 'reject')}
            >
              Reject
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Created {format(new Date(booking.created_at), 'PPp')}
        </div>
      </div>
    </Card>
  );

  if (!currentProvider) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Provider Profile Required</h2>
          <p className="text-muted-foreground">
            You need to set up your provider profile to manage bookings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">Manage your service bookings</p>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">
            Requests ({filterBookings(['request', 'pending_provider']).length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({filterBookings(['confirmed']).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterBookings(['completed']).length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({bookings?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="h-48 animate-pulse bg-muted" />
              ))}
            </div>
          ) : filterBookings(['request', 'pending_provider']).length > 0 ? (
            filterBookings(['request', 'pending_provider']).map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pending requests</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {filterBookings(['confirmed']).length > 0 ? (
            filterBookings(['confirmed']).map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No upcoming bookings</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {filterBookings(['completed']).length > 0 ? (
            filterBookings(['completed']).map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No completed bookings</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          {bookings && bookings.length > 0 ? (
            bookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No bookings yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {selectedBooking && actionType && (
        <BookingActionModal
          booking={selectedBooking}
          actionType={actionType}
          onClose={() => {
            setSelectedBooking(null);
            setActionType(null);
          }}
        />
      )}
    </div>
  );
};
