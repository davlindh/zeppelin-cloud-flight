import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[handle-ticket-webhook] Missing required environment variables");
    return new Response("Missing configuration", { status: 500, headers: corsHeaders });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("[handle-ticket-webhook] Missing Stripe signature");
    return new Response("Missing Stripe signature", { status: 400, headers: corsHeaders });
  }

  const body = await req.text();
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });

  let event: Stripe.Event;

  try {
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      console.warn("[handle-ticket-webhook] No webhook secret configured, skipping verification");
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("[handle-ticket-webhook] Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log("[handle-ticket-webhook] Processing event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const ticketOrderId = session.metadata?.ticket_order_id;

        if (!ticketOrderId) {
          console.warn("[handle-ticket-webhook] checkout.session.completed missing ticket_order_id");
          break;
        }

        console.log("[handle-ticket-webhook] Confirming ticket order:", ticketOrderId);

        const paymentMethod =
          Array.isArray(session.payment_method_types) && session.payment_method_types.length > 0
            ? session.payment_method_types[0]
            : null;

        // Update order to confirmed (triggers instance generation)
        const { error: updateError } = await supabase
          .from("event_ticket_orders")
          .update({
            status: "confirmed",
            payment_reference: session.id,
            payment_method: paymentMethod,
            paid_at: new Date().toISOString(),
          })
          .eq("id", ticketOrderId)
          .eq("status", "pending"); // Only update if still pending

        if (updateError) {
          console.error("[handle-ticket-webhook] Failed to confirm ticket order:", updateError);
        } else {
          console.log("[handle-ticket-webhook] Ticket order confirmed successfully:", ticketOrderId);
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn("[handle-ticket-webhook] Ticket payment failed:", pi.id, pi.last_payment_error);
        break;
      }

      default:
        console.log("[handle-ticket-webhook] Unhandled event type:", event.type);
        break;
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[handle-ticket-webhook] Error processing webhook:", err);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});
