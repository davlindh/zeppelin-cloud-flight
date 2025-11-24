import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@16.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const origin = req.headers.get("origin") ?? "";
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id is required" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Load order with items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_email,
        customer_name,
        total_amount,
        currency,
        status,
        order_items (
          id,
          item_title,
          quantity,
          unit_price
        )
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Order load error", orderError);
      return new Response(JSON.stringify({ error: "Order not found" }), { 
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (order.status !== "pending") {
      return new Response(JSON.stringify({ error: "Order is not in pending status" }), { 
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Build line items from order items
    const lineItems = order.order_items.map((item: any) => ({
      quantity: item.quantity,
      price_data: {
        currency: order.currency.toLowerCase(),
        unit_amount: Math.round(item.unit_price * 100),
        product_data: {
          name: item.item_title,
        },
      },
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customer_email || undefined,
      line_items: lineItems,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
      success_url: `${origin}/marketplace/order-success?order_id=${order.id}`,
      cancel_url: `${origin}/marketplace/cart?checkout=canceled`,
    });

    // Store payment reference
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_intent_id: session.id,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update payment_intent_id", updateError);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-marketplace-checkout error", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
