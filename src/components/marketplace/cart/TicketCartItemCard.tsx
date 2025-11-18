import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/marketplace/CartContext';
import type { EventTicketCartItem } from '@/types/marketplace/cart';
import { Ticket, X, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface TicketCartItemCardProps {
  item: EventTicketCartItem;
}

export const TicketCartItemCard: React.FC<TicketCartItemCardProps> = ({ item }) => {
  const { removeTicket, updateTicketQuantity } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeTicket(item.ticketTypeId);
      return;
    }
    if (item.maxQuantity && newQuantity > item.maxQuantity) {
      return;
    }
    updateTicketQuantity(item.ticketTypeId, newQuantity);
  };

  const subtotal = item.price * item.quantity;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Ticket Icon */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Ticket className="h-8 w-8 text-primary" />
          </div>

          {/* Ticket Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    Event Ticket
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {item.eventTitle}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTicket(item.ticketTypeId)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Event Date */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(item.eventDate), 'PPP')}</span>
            </div>

            {/* Quantity and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="text-sm font-medium w-8 text-center">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {item.price.toFixed(2)} SEK × {item.quantity}
                </p>
                <p className="font-semibold">{subtotal.toFixed(2)} SEK</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
