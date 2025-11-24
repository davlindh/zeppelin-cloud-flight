import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (!orderId) {
          console.warn("checkout.session.completed missing order_id");
          break;
        }

        const paymentMethod = 
          Array.isArray(session.payment_method_types) && session.payment_method_types.length > 0
            ? session.payment_method_types[0]
            : null;

        // Update order status to paid
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "paid",
            payment_intent_id: session.id,
            payment_method: paymentMethod,
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("status", "pending");

        if (updateError) {
          console.error("Failed to update order status", updateError);
        } else {
          console.log("Order marked as paid:", orderId);
        }

        // The existing trigger will handle inventory reduction
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn("Payment failed", pi.id, pi.last_payment_error);
        break;
      }

      default:
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("handle-marketplace-webhook error", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
