import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, DollarSign, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventWithTickets {
  id: string;
  title: string;
  starts_at: string;
  ticket_count: number;
  total_sold: number;
  total_revenue: number;
  low_stock_count: number;
}

export const EventTicketsOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['event-tickets-overview'],
    queryFn: async () => {
      // Get all events with tickets
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, starts_at')
        .eq('status', 'published')
        .order('starts_at', { ascending: true });

      if (eventsError) throw eventsError;

      // For each event, get ticket stats
      const eventsWithStats = await Promise.all(
        (events || []).map(async (event) => {
          const { data: tickets } = await supabase
            .from('products')
            .select('id, stock_quantity, selling_price')
            .eq('event_id', event.id)
            .eq('product_type', 'event_ticket');

          const ticket_count = tickets?.length || 0;
          const low_stock_count = tickets?.filter(t => t.stock_quantity <= 5 && t.stock_quantity > 0).length || 0;

          // Calculate sold tickets from orders
          let total_sold = 0;
          let total_revenue = 0;

          if (tickets && tickets.length > 0) {
            const ticketIds = tickets.map(t => t.id);
            const { data: orderItems } = await supabase
              .from('order_items')
              .select('quantity, unit_price, order:orders!inner(status)')
              .in('item_id', ticketIds)
              .eq('item_type', 'product')
              .in('order.status', ['paid', 'completed']);

            total_sold = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            total_revenue = orderItems?.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 0)), 0) || 0;
          }

          return {
            ...event,
            ticket_count,
            total_sold,
            total_revenue,
            low_stock_count,
          };
        })
      );

      // Calculate totals
      const totals = {
        total_events: eventsWithStats.length,
        total_tickets: eventsWithStats.reduce((sum, e) => sum + e.ticket_count, 0),
        total_sold: eventsWithStats.reduce((sum, e) => sum + e.total_sold, 0),
        total_revenue: eventsWithStats.reduce((sum, e) => sum + e.total_revenue, 0),
        low_stock_alerts: eventsWithStats.reduce((sum, e) => sum + e.low_stock_count, 0),
      };

      return {
        events: eventsWithStats.filter(e => e.ticket_count > 0),
        totals,
      };
    },
  });

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="p-6">Loading...</div>
      </AdminRoute>
    );
  }

  const { events = [], totals } = overview || { totals: {} };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Event Tickets Overview</h1>
            <p className="text-muted-foreground">
              Monitor ticket sales across all events
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.total_revenue?.toFixed(0) || 0} SEK</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.total_sold || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{totals.low_stock_alerts || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Events with Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No events with tickets yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.starts_at).toLocaleDateString()} • {event.ticket_count} ticket types
                        </p>
                      </div>
                      <div className="flex items-center gap-6 mr-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Sold</p>
                          <p className="font-semibold">{event.total_sold}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="font-semibold">{event.total_revenue.toFixed(0)} SEK</p>
                        </div>
                        {event.low_stock_count > 0 && (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                      >
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
};
