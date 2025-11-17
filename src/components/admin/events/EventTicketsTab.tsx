import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Ticket, DollarSign, TrendingUp } from 'lucide-react';
import { useEventTickets, useTicketSalesStats } from '@/hooks/admin/useEventTickets';
import { TicketCard } from './TicketCard';
import { TicketCreationModal } from './TicketCreationModal';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/unified';

interface EventTicketsTabProps {
  eventId: string;
  eventTitle: string;
}

export const EventTicketsTab: React.FC<EventTicketsTabProps> = ({ eventId, eventTitle }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: tickets = [], isLoading } = useEventTickets(eventId);
  const { data: stats } = useTicketSalesStats(eventId);
  const { deleteProduct } = useProductMutations();
  const { toast } = useToast();

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This cannot be undone.')) return;
    
    try {
      await deleteProduct(ticketId);
      toast({
        title: 'Ticket deleted',
        description: 'The ticket has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete ticket',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
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
            <div className="text-2xl font-bold">{stats?.total_revenue?.toFixed(0) || 0} SEK</div>
            <p className="text-xs text-muted-foreground">
              From {stats?.total_sold || 0} tickets sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_sold || 0}</div>
            <p className="text-xs text-muted-foreground">
              {tickets.reduce((sum, t) => sum + ((t as any).stock_quantity || 0), 0)} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.average_price?.toFixed(0) || 0} SEK</div>
            <p className="text-xs text-muted-foreground">
              Per ticket sold
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

      {tickets.length === 0 ? (
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
          {tickets.map((ticket) => {
            const ticketStats = stats?.by_ticket_type.find(s => s.ticket_id === ticket.id);
            return (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                stats={ticketStats}
                onDelete={handleDelete}
              />
            );
          })}
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
