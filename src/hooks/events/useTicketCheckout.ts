import { supabase } from "@/integrations/supabase/client";

interface TicketCheckoutParams {
  ticketOrderId: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export function useTicketCheckout() {
  const createCheckout = async ({
    ticketOrderId,
    customerEmail,
    successUrl,
    cancelUrl,
  }: TicketCheckoutParams) => {
    const { data, error } = await supabase.functions.invoke(
      "create-ticket-checkout",
      {
        body: {
          ticket_order_id: ticketOrderId,
          customer_email: customerEmail,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      },
    );

    if (error) {
      console.error("create-ticket-checkout error", error);
      throw error;
    }

    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error("No checkout URL returned from backend");
    }
  };

  return { createCheckout };
}
