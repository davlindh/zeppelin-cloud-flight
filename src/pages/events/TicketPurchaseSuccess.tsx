import { useSearchParams, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function TicketPurchaseSuccess() {
  const [params] = useSearchParams();
  const { slug } = useParams();
  const orderId = params.get("order_id");

  const { data: order, isLoading } = useQuery({
    queryKey: ["ticket-order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from("event_ticket_orders")
        .select(`
          *,
          event:events(*),
          ticket_type:event_ticket_types(*)
        `)
        .eq("id", orderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Purchase Complete!</h1>
          <p className="text-muted-foreground">
            Your payment was successful and your tickets have been created.
          </p>
        </div>

        {isLoading && (
          <Card className="w-full">
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">Loading order details...</p>
            </CardContent>
          </Card>
        )}

        {order && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event:</span>
                <span className="font-medium">{order.event?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket Type:</span>
                <span className="font-medium">{order.ticket_type?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">
                  {(order.unit_price * order.quantity).toFixed(2)} {order.currency}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button asChild className="flex-1">
            <Link to="/marketplace/my-tickets">View My Tickets</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to={`/events/${slug}`}>Back to Event</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          A confirmation email with your tickets will be sent shortly.
        </p>
      </div>
    </div>
  );
}
