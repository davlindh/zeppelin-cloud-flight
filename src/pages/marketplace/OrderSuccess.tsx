import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Package, Truck, Mail, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/currency";

export function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const viewMode = params.get("view"); // 'success', 'confirm', null
  const { toast } = useToast();

  // Verify payment mutation - only for payment success flows
  const verifyPayment = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke("verify-order-payment", {
        body: { order_id: orderId },
      });
      if (error) throw error;
      return data;
    },
  });

  // Send confirmation email mutation
  const sendConfirmation = useMutation({
    mutationFn: async (order: any) => {
      const { data, error } = await supabase.functions.invoke("send-order-confirmation", {
        body: {
          orderId: order.id,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
        },
      });
      if (error) throw error;
      return data;
    },
  });

  const { data: order, refetch, isLoading: orderLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            item_title,
            quantity,
            unit_price,
            total_price
          )
        `
        )
        .eq("id", orderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  // Verify payment and send email on mount - only for new orders
  useEffect(() => {
    if (!orderId || viewMode !== 'success') return;

    const processOrder = async () => {
      try {
        // First verify the payment
        const result = await verifyPayment.mutateAsync(orderId);

        if (result.success) {
          // Refetch order to get updated status
          await refetch();

          // Then send confirmation email
          if (order) {
            await sendConfirmation.mutateAsync(order);
          }
        }
      } catch (error) {
        console.error("Error processing order:", error);
        toast({
          title: "Processing Error",
          description: "There was an issue processing your order. Please contact support.",
          variant: "destructive",
        });
      }
    };

    processOrder();
  }, [orderId, viewMode]);

  // Loading states
  if (viewMode === 'success' && verifyPayment.isPending) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verifierar betalning...</h1>
        <p className="text-muted-foreground">Vänta medan vi bekräftar din beställning.</p>
      </div>
    );
  }

  if (orderLoading || !order) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Laddar orderdetaljer...</h1>
        <p className="text-muted-foreground">Vänta medan vi hämtar din orderinformation.</p>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.created_at);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {viewMode === 'success' && (
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Beställning genomförd!</h1>
          <p className="text-muted-foreground">
            Tack för ditt köp. Vi har skickat en bekräftelse till {order.customer_email}.
          </p>
        </div>
      )}

      {viewMode === 'confirm' && (
        <div className="text-center mb-8">
          <Package className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Orderdetaljer</h1>
          <p className="text-muted-foreground">
            Information om din beställning #{order.order_number}
          </p>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order #{order.order_number}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {format(new Date(order.created_at), 'PPP')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Orderstatus</p>
                <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Beräknad leverans</p>
                <p className="text-sm text-muted-foreground">
                  {format(estimatedDelivery, 'PPP')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Levereras till</p>
                <p className="text-sm text-muted-foreground">
                  {typeof order.shipping_address === 'object' && order.shipping_address
                    ? `${(order.shipping_address as any).city}, ${(order.shipping_address as any).country}`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="font-semibold">Orderprodukter</h3>
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.item_title}</p>
                  <p className="text-sm text-muted-foreground">
                    Antal: {item.quantity} • {formatCurrency(item.unit_price)} per styck
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(item.total_price)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Delsumma</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Moms</span>
              <span>{formatCurrency(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frakt</span>
              <span>{formatCurrency(order.shipping_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Rabatt</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Totalt</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        {viewMode === 'success' ? (
          <>
            <Button asChild>
              <Link to={`/order-tracking?order=${order.order_number}&email=${order.customer_email}`}>
                <Truck className="mr-2 h-4 w-4" />
                Spåra beställning
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketplace">Fortsätt handla</Link>
            </Button>
          </>
        ) : (
          <Button variant="outline" asChild>
            <Link to="/marketplace/my-orders">Tillbaka till mina beställningar</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
