import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const { toast } = useToast();

  // Verify payment mutation
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

  const { data: order, refetch } = useQuery({
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
            unit_price
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

  // Verify payment and send email on mount
  useEffect(() => {
    if (!orderId) return;

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
  }, [orderId]);

  if (verifyPayment.isPending) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
        <p className="text-muted-foreground">Please wait while we confirm your order.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Beställning genomförd!</h1>
        <p className="text-muted-foreground">
          Tack för ditt köp. Vi har skickat en bekräftelse till {order?.customer_email}.
        </p>
      </div>

      {order && (
        <div className="rounded-xl border p-6 space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Ordernummer</div>
            <div className="font-semibold">{order.order_number}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">Produkter</div>
            <div className="space-y-2">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.item_title} x {item.quantity}
                  </span>
                  <span>{(item.unit_price * item.quantity).toFixed(0)} kr</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Totalt</span>
              <span>{order.total_amount.toFixed(0)} kr</span>
            </div>
          </div>

          {order.shipping_address && typeof order.shipping_address === 'object' && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Leveransadress
              </div>
              <div className="text-sm">
                <div>{order.customer_name}</div>
                <div>{(order.shipping_address as any).street}</div>
                <div>
                  {(order.shipping_address as any).postal_code}{" "}
                  {(order.shipping_address as any).city}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 mt-8 justify-center">
        <Button asChild>
          <Link to="/marketplace/my-orders">Mina beställningar</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/marketplace">Fortsätt handla</Link>
        </Button>
      </div>
    </div>
  );
}
