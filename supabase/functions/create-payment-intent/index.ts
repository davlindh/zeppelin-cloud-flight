import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
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

    // Create PaymentIntent instead of Checkout Session
    // This allows us to use embedded Payment Elements
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_amount * 100), // Convert to cents
      currency: order.currency.toLowerCase(),
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
      // Optional: customer creation for saved payment methods
      customer_email: order.customer_email,
      receipt_email: order.customer_email,
      description: `Order #${order.order_number}`,
      // Payment methods can be configured here for embedded checkout
      payment_method_types: ['card'], // Can add 'klarna', etc. when implemented
      // Statement descriptor for bank statements
      statement_descriptor: 'Zeppelin Cloud',
    });

    // Store PaymentIntent ID instead of session ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_intent_id: paymentIntent.id,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update payment_intent_id", updateError);
    }

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-payment-intent error", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
