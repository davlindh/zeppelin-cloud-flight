import { supabase } from "@/integrations/supabase/client";

interface MarketplaceCheckoutParams {
  orderId: string;
}

export function useMarketplaceCheckout() {
  const createCheckout = async ({ orderId }: MarketplaceCheckoutParams) => {
    const { data, error } = await supabase.functions.invoke(
      "create-marketplace-checkout",
      {
        body: { order_id: orderId },
      }
    );

    if (error) {
      console.error("create-marketplace-checkout error", error);
      throw error;
    }

    if (data?.url) {
      // Open in new tab to bypass iframe restrictions
      const newWindow = window.open(data.url, '_blank');
      if (!newWindow) {
        // Fallback: try to break out of iframe if popup blocked
        if (window.top) {
          window.top.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      }
    } else {
      throw new Error("No checkout URL returned from backend");
    }
  };

  return { createCheckout };
}
