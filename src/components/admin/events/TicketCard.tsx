import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket } from 'lucide-react';
import type { TicketAvailability } from '@/hooks/events/useEventTicketTypes';

interface TicketCardProps {
  ticket: TicketAvailability;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const stockPercentage = ticket.capacity > 0 
    ? (ticket.sold / ticket.capacity) * 100
    : 0;

  const getStockStatus = () => {
    if (ticket.remaining === 0) return { label: 'Sold Out', variant: 'destructive' as const };
    if (ticket.remaining <= 5) return { label: 'Low Stock', variant: 'default' as const };
    return { label: 'Available', variant: 'secondary' as const };
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{ticket.name}</h3>
              <p className="text-2xl font-bold text-primary">{ticket.price} SEK</p>
            </div>
          </div>
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
        </div>

        {ticket.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
        )}

        {ticket.badge && (
          <Badge variant="outline" className="w-fit">{ticket.badge}</Badge>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sold</span>
            <span className="font-semibold">{ticket.sold} / {ticket.capacity}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="font-semibold">{(ticket.sold * ticket.price).toFixed(0)} SEK</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="font-semibold">{ticket.remaining}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
