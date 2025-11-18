import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Ticket } from 'lucide-react';
import { useEventTicketOrders } from '@/hooks/events/useEventTicketOrders';
import { format } from 'date-fns';

interface EventTicketOrdersTabProps {
  eventId: string;
}

export const EventTicketOrdersTab: React.FC<EventTicketOrdersTabProps> = ({ eventId }) => {
  const { data: orders = [], isLoading } = useEventTicketOrders(eventId);

  if (isLoading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Ticket Orders</h2>
        <p className="text-sm text-muted-foreground">
          View all ticket purchases for this event.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center">
              Ticket orders will appear here once customers start purchasing
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-sm">
                      {format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.ticket_type?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.user?.email || 'Guest'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {order.quantity}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {(order.quantity * order.unit_price).toFixed(2)} {order.currency}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === 'confirmed' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'cancelled' ? 'destructive' :
                          'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
