import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTicketCheckout } from '@/hooks/events/useTicketCheckout';
import { useStockManagement } from '@/hooks/useStockManagement';
import { supabase } from '@/integrations/supabase/client';
import type { TicketAvailability } from '@/hooks/events/useEventTicketTypes';
import { Ticket, Users, AlertCircle, Loader2 } from 'lucide-react';

interface PublicTicketCardProps {
  ticket: TicketAvailability;
  eventSlug: string;
}

export const PublicTicketCard: React.FC<PublicTicketCardProps> = ({ ticket, eventSlug }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { createCheckout } = useTicketCheckout();
  const { checkStock } = useStockManagement();

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

  // Check stock availability using our new hook
  const stockStatus = checkStock(ticket.id, quantity);

  const handleBuyNow = async () => {
    if (isSoldOut || isSubmitting || !stockStatus.available) return;
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

      // Initiate Stripe checkout with loading overlay
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

  const responsiveClasses = isMobile 
    ? 'text-sm px-3 py-2' 
    : 'text-base px-4 py-3';

  return (
    <Card className={`
      ${isSoldOut ? 'opacity-60' : ''} 
      transition-all duration-200 hover:shadow-md
      ${isMobile ? 'rounded-lg' : 'rounded-xl'}
    `}>
      <CardHeader className={isMobile ? 'p-4 pb-3' : 'p-6 pb-4'}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <h3 className={`font-semibold truncate ${isMobile ? 'text-base' : 'text-lg'}`}>
                {ticket.name}
              </h3>
              {ticket.badge && (
                <Badge 
                  variant="secondary" 
                  className={isMobile ? 'text-xs px-2 py-1' : 'text-sm'}
                >
                  {ticket.badge}
                </Badge>
              )}
            </div>
            {ticket.description && (
              <p className={`text-muted-foreground line-clamp-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {ticket.description}
              </p>
            )}
          </div>
          <Ticket className={`text-muted-foreground ml-2 flex-shrink-0 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </div>
      </CardHeader>

      <CardContent className={isMobile ? 'p-4 pt-0 space-y-4' : 'space-y-6'}>
        {/* Price */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {ticket.price.toFixed(2)} {ticket.currency}
          </span>
          {ticket.original_price && ticket.original_price > ticket.price && (
            <span className={`text-muted-foreground line-through ${isMobile ? 'text-sm' : 'text-base'}`}>
              {ticket.original_price.toFixed(2)} {ticket.currency}
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="space-y-3">
          <div className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
              Availability
            </span>
            <span className="font-medium">
              {isSoldOut ? (
                <span className="text-destructive text-xs sm:text-sm">Sold Out</span>
              ) : (
                <span className="text-xs sm:text-sm">
                  {ticket.remaining} of {ticket.capacity} left
                </span>
              )}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className={`w-full bg-muted rounded-full overflow-hidden ${isMobile ? 'h-1.5' : 'h-2'}`}>
            <div
              className={`h-full transition-all duration-300 ${
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
            <div className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span>Only {ticket.remaining} tickets remaining!</span>
            </div>
          )}

          {/* Real-time stock alerts */}
          {stockStatus.lowStock && (
            <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span>Low stock - order soon!</span>
            </div>
          )}
        </div>

        {/* Quantity Selector */}
        {!isSoldOut && (
          <div className="space-y-3">
            <Label 
              htmlFor={`quantity-${ticket.id}`} 
              className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}
            >
              Quantity 
              {ticket.per_user_limit && (
                <span className="block sm:inline sm:ml-1">
                  (max {ticket.per_user_limit} per person)
                </span>
              )}
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className={isMobile ? 'h-9 w-9 p-0' : ''}
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
                className={`
                  text-center
                  ${isMobile ? 'w-16 h-9 text-sm' : 'w-20'}
                `}
              />
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setQuantity(Math.min(maxPurchase, quantity + 1))}
                disabled={quantity >= maxPurchase}
                className={isMobile ? 'h-9 w-9 p-0' : ''}
              >
                +
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className={isMobile ? 'p-4 pt-0' : ''}>
        <Button
          className={`
            w-full transition-all duration-200
            ${responsiveClasses}
            ${!isMobile ? 'h-12' : ''}
            ${stockStatus.outOfStock ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={handleBuyNow}
          disabled={isSoldOut || isSubmitting || !stockStatus.available}
        >
          {isSubmitting ? (
            <>
              <Loader2 className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />
              {isMobile ? 'Processing...' : 'Processing...'}
            </>
          ) : isSoldOut ? (
            'Sold Out'
          ) : !stockStatus.available ? (
            'Not Available'
          ) : (
            <>
              Buy {quantity > 1 ? `${quantity} ` : ''}Now
              {quantity > 1 && (
                <span className="ml-1">
                  ({((ticket.price * quantity)).toFixed(2)} {ticket.currency})
                </span>
              )}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
