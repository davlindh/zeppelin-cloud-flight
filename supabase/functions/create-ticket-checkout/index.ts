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

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const originFromHeader = req.headers.get("origin");
    const defaultOrigin = Deno.env.get("PUBLIC_SITE_URL") ?? "";
    const origin = originFromHeader || defaultOrigin;
    const { ticket_order_id, customer_email, success_url, cancel_url } = await req.json();

    if (!ticket_order_id) {
      return new Response(
        JSON.stringify({ error: "ticket_order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[create-ticket-checkout] Loading order:", ticket_order_id);

    // Load order with ticket type and event details
    const { data: order, error: orderError } = await supabase
      .from("event_ticket_orders")
      .select(`
        id,
        event_id,
        ticket_type_id,
        quantity,
        unit_price,
        currency,
        status,
        payment_reference,
        ticket_type:event_ticket_types (
          name,
          price,
          currency
        ),
        event:events (
          id,
          title,
          slug
        )
      `)
      .eq("id", ticket_order_id)
      .single();

    if (orderError || !order) {
      console.error("[create-ticket-checkout] Order load error:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.status !== "pending") {
      console.error("[create-ticket-checkout] Order not pending:", order.status);
      return new Response(
        JSON.stringify({ error: "Order is not in pending status" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use price from ticket type (DB) not client
    const unitAmount = Math.round((order.ticket_type?.price ?? order.unit_price) * 100);
    const currency = (order.ticket_type?.currency || order.currency || "SEK").toLowerCase();

    console.log("[create-ticket-checkout] Creating checkout session:", {
      quantity: order.quantity,
      unitAmount,
      currency,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customer_email || undefined,
      line_items: [
        {
          quantity: order.quantity,
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: order.ticket_type?.name || `Ticket to ${order.event?.title ?? "event"}`,
              metadata: {
                event_id: order.event_id,
                ticket_type_id: order.ticket_type_id,
              },
            },
          },
        },
      ],
      metadata: {
        ticket_order_id: order.id,
        event_id: order.event_id,
        ticket_type_id: order.ticket_type_id,
      },
      success_url:
        success_url ||
        `${origin}/events/${order.event?.slug ?? ""}/tickets/success?order_id=${order.id}`,
      cancel_url:
        cancel_url ||
        `${origin}/events/${order.event?.slug ?? ""}?checkout=canceled`,
    });

    console.log("[create-ticket-checkout] Session created:", session.id);

    // Store payment reference on the order
    const { error: updateError } = await supabase
      .from("event_ticket_orders")
      .update({ payment_reference: session.id })
      .eq("id", order.id);

    if (updateError) {
      console.error("[create-ticket-checkout] Failed to update payment_reference:", updateError);
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[create-ticket-checkout] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
