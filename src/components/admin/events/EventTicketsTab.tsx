import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Ticket, DollarSign, TrendingUp } from 'lucide-react';
import { useEventTicketTypes } from '@/hooks/events/useEventTicketTypes';
import { TicketCard } from './TicketCard';
import { TicketCreationModal } from './TicketCreationModal';
import { useToast } from '@/hooks/use-toast';

interface EventTicketsTabProps {
  eventId: string;
  eventTitle: string;
}

export const EventTicketsTab: React.FC<EventTicketsTabProps> = ({ eventId, eventTitle }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: ticketTypes = [], isLoading } = useEventTicketTypes(eventId);
  const { toast } = useToast();

  // Calculate aggregate stats from ticket types
  const stats = {
    total_revenue: ticketTypes.reduce((sum, t) => sum + (t.sold * t.price), 0),
    total_sold: ticketTypes.reduce((sum, t) => sum + t.sold, 0),
    total_capacity: ticketTypes.reduce((sum, t) => sum + t.capacity, 0),
    total_remaining: ticketTypes.reduce((sum, t) => sum + t.remaining, 0),
    average_price: ticketTypes.length > 0 
      ? ticketTypes.reduce((sum, t) => sum + t.price, 0) / ticketTypes.length 
      : 0,
  };

  if (isLoading) {
    return <div className="p-6">Loading tickets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_revenue.toFixed(0)} SEK</div>
            <p className="text-xs text-muted-foreground">
              From {stats.total_sold} tickets sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_sold}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_remaining} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_price.toFixed(0)} SEK</div>
            <p className="text-xs text-muted-foreground">
              Average ticket price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Grid */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ticket Types</h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {ticketTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Create ticket types to start selling event access
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ticketTypes.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
            />
          ))}
        </div>
      )}

      <TicketCreationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        eventId={eventId}
        eventTitle={eventTitle}
      />
    </div>
  );
};
