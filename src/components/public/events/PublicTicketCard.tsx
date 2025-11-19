import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTicketCheckout } from '@/hooks/events/useTicketCheckout';
import { supabase } from '@/integrations/supabase/client';
import type { TicketAvailability } from '@/hooks/events/useEventTicketTypes';
import { Ticket, Users, AlertCircle } from 'lucide-react';

interface PublicTicketCardProps {
  ticket: TicketAvailability;
  eventSlug: string;
}

export const PublicTicketCard: React.FC<PublicTicketCardProps> = ({ ticket, eventSlug }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { createCheckout } = useTicketCheckout();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const isSoldOut = ticket.remaining <= 0;
  const isLowStock = ticket.remaining > 0 && ticket.remaining < 10;
  const maxPurchase = ticket.per_user_limit 
    ? Math.min(ticket.remaining, ticket.per_user_limit)
    : ticket.remaining;

  const handleBuyNow = async () => {
    if (isSoldOut || isSubmitting) return;
    if (quantity > maxPurchase) return;

    try {
      setIsSubmitting(true);

      // Create pending order via RPC
      const { data: order, error } = await supabase.rpc(
        'create_event_ticket_order',
        {
          p_ticket_type_id: ticket.id,
          p_quantity: quantity,
        }
      );

      if (error) {
        console.error('create_event_ticket_order error', error);
        toast({
          variant: 'destructive',
          title: 'Order Failed',
          description: error.message,
        });
        return;
      }

      // Initiate Stripe checkout
      await createCheckout({
        ticketOrderId: order.id,
        customerEmail: user?.email ?? undefined,
        successUrl: `${window.location.origin}/events/${eventSlug}/tickets/success?order_id=${order.id}`,
        cancelUrl: `${window.location.origin}/events/${eventSlug}?checkout=canceled`,
      });
    } catch (error) {
      console.error('Ticket purchase error:', error);
      toast({
        variant: 'destructive',
        title: 'Purchase Failed',
        description: 'Could not complete ticket purchase',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stockPercentage = (ticket.remaining / ticket.capacity) * 100;

  return (
    <Card className={isSoldOut ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{ticket.name}</h3>
              {ticket.badge && (
                <Badge variant="secondary">{ticket.badge}</Badge>
              )}
            </div>
            {ticket.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {ticket.description}
              </p>
            )}
          </div>
          <Ticket className="h-5 w-5 text-muted-foreground ml-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {ticket.price.toFixed(2)} {ticket.currency}
          </span>
          {ticket.original_price && ticket.original_price > ticket.price && (
            <span className="text-sm text-muted-foreground line-through">
              {ticket.original_price.toFixed(2)} {ticket.currency}
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              Availability
            </span>
            <span className="font-medium">
              {isSoldOut ? (
                <span className="text-destructive">Sold Out</span>
              ) : (
                <span>
                  {ticket.remaining} of {ticket.capacity} left
                </span>
              )}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isSoldOut
                  ? 'bg-destructive'
                  : stockPercentage <= 20
                  ? 'bg-warning'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, stockPercentage))}%` }}
            />
          </div>

          {isLowStock && !isSoldOut && (
            <div className="flex items-center gap-1 text-xs text-warning">
              <AlertCircle className="h-3 w-3" />
              <span>Only {ticket.remaining} tickets remaining!</span>
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        {!isSoldOut && (
          <div className="space-y-2">
            <Label htmlFor={`quantity-${ticket.id}`}>
              Quantity {ticket.per_user_limit && `(max ${ticket.per_user_limit} per person)`}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id={`quantity-${ticket.id}`}
                type="number"
                min="1"
                max={maxPurchase}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(maxPurchase, Math.max(1, val)));
                }}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(maxPurchase, quantity + 1))}
                disabled={quantity >= maxPurchase}
              >
                +
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={handleBuyNow}
          disabled={isSoldOut || isSubmitting}
        >
          {isSoldOut ? 'Sold Out' : isSubmitting ? 'Processing...' : 'Buy Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};
