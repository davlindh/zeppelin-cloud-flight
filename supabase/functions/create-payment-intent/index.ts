import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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
    const { order_id, customer_email } = await req.json();

    if (!order_id) {
      console.error("Missing order_id in request");
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
        user_id,
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

    // SECURITY: Verify ownership
    const authHeader = req.headers.get('Authorization');
    
    if (order.user_id) {
      // This is an authenticated user's order - verify JWT
      if (!authHeader) {
        console.error("No auth header for authenticated order", { orderId: order.id });
        return new Response(JSON.stringify({ error: "Authentication required for this order" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Create a client with anon key for JWT verification
      const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
      
      if (authError || !user || user.id !== order.user_id) {
        console.error("Unauthorized payment attempt", { 
          userId: user?.id, 
          orderUserId: order.user_id,
          authError 
        });
        return new Response(JSON.stringify({ error: "Forbidden - not your order" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      console.log("Authenticated user verified for order", { userId: user.id, orderId: order.id });
    } else {
      // Guest checkout - verify email matches
      if (!customer_email || customer_email.toLowerCase() !== order.customer_email?.toLowerCase()) {
        console.error("Guest email mismatch", { 
          provided: customer_email, 
          expected: order.customer_email 
        });
        return new Response(JSON.stringify({ error: "Email verification required for guest orders" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      console.log("Guest email verified for order", { email: customer_email, orderId: order.id });
    }

    if (order.status !== "pending") {
      return new Response(JSON.stringify({ error: "Order is not in pending status" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total_amount * 100),
      currency: order.currency.toLowerCase(),
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
      receipt_email: order.customer_email,
      description: `Order #${order.order_number}`,
      payment_method_types: ['card'],
      statement_descriptor: 'Zeppelin Cloud',
    });

    console.log("PaymentIntent created", { 
      paymentIntentId: paymentIntent.id, 
      orderId: order.id 
    });

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
