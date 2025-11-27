import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced order status types
enum OrderStatus {
  pending = 'pending',
  paid = 'paid',
  failed = 'failed',
  canceled = 'canceled',
  refunded = 'refunded',
  disputed = 'disputed'
}

// Centralized order update function
async function updateOrderStatus(supabase: any, orderId: string, status: OrderStatus, metadata?: any) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Add metadata fields
  if (metadata?.payment_intent_id) updateData.payment_intent_id = metadata.payment_intent_id;
  if (metadata?.payment_method) updateData.payment_method = metadata.payment_method;
  if (metadata?.amount_received) updateData.amount_received = metadata.amount_received;
  if (metadata?.paid_at) updateData.paid_at = metadata.paid_at;
  if (metadata?.failure_reason) updateData.failure_reason = metadata.failure_reason;
  if (metadata?.failure_code) updateData.failure_code = metadata.failure_code;
  if (metadata?.dispute_id) updateData.dispute_id = metadata.dispute_id;
  if (metadata?.refund_id) updateData.refund_id = metadata.refund_id;
  if (metadata?.refunded_amount) updateData.refunded_amount = metadata.refunded_amount;

  const { error: updateError } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (updateError) {
    console.error("Failed to update order status", updateError);
    throw new Error(`Order update failed: ${updateError.message}`);
  }

  console.log(`Order ${orderId} status updated to: ${status}`);

  // Trigger analytics tracking
  await trackPaymentAnalytics(supabase, orderId, status, metadata);
}

// Payment analytics tracking
async function trackPaymentAnalytics(supabase: any, orderId: string, status: OrderStatus, metadata?: any) {
  try {
    const analyticsData = {
      order_id: orderId,
      event_type: `payment_${status}`,
      payment_method: metadata?.payment_method,
      amount: metadata?.amount_received,
      currency: metadata?.currency,
      timestamp: new Date().toISOString(),
    };

    await supabase.from('payment_analytics').insert(analyticsData);
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
    // Don't fail the webhook for analytics issues
  }
}

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
      // ===== PAYMENT INTENT EVENTS (New API) =====

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;

        if (!orderId) {
          console.warn("payment_intent.succeeded missing order_id");
          break;
        }

        await updateOrderStatus(supabase, orderId, OrderStatus.paid, {
          payment_intent_id: pi.id,
          payment_method: pi.payment_method_types[0],
          amount_received: pi.amount_received,
          paid_at: new Date().toISOString(),
        });

        console.log("Payment succeeded for order:", orderId);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;

        if (!orderId) {
          console.warn("payment_intent.payment_failed missing order_id");
          break;
        }

        const failureReason = pi.last_payment_error?.message || "Payment declined";
        const failureCode = pi.last_payment_error?.code || "unknown";

        await updateOrderStatus(supabase, orderId, OrderStatus.failed, {
          payment_intent_id: pi.id,
          failure_reason: failureReason,
          failure_code: failureCode,
        });

        console.warn("Payment failed for order:", orderId, {
          reason: failureReason,
          code: failureCode
        });

        // TODO: Trigger payment recovery workflow
        // - Send customer notification
        // - Schedule retry attempt
        // - Update attempt counter
        break;
      }

      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.order_id;

        if (!orderId) {
          console.warn("payment_intent.canceled missing order_id");
          break;
        }

        await updateOrderStatus(supabase, orderId, OrderStatus.canceled, {
          payment_intent_id: pi.id,
        });

        console.log("Payment canceled for order:", orderId);
        break;
      }

      // ===== LEGACY CHECKOUT SESSION EVENTS (Keep for backward compatibility) =====

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

        // Update order status to paid (legacy compatibility)
        await updateOrderStatus(supabase, orderId, OrderStatus.paid, {
          payment_intent_id: session.id,
          payment_method: paymentMethod,
          paid_at: new Date().toISOString(),
        });

        console.log("Legacy checkout completed for order:", orderId);
        break;
      }

      // ===== DISPUTE HANDLING =====

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const paymentIntent = dispute.payment_intent as string;

        // Find order by payment_intent_id
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_intent_id", paymentIntent)
          .single();

        if (order) {
          await updateOrderStatus(supabase, order.id, OrderStatus.disputed, {
            dispute_id: dispute.id,
          });

          console.log("Dispute created for order:", order.id);
          // TODO: Notify customer service team
        }

        break;
      }

      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        const paymentIntent = dispute.payment_intent as string;

        // Find order by payment_intent_id
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_intent_id", paymentIntent)
          .single();

        if (order) {
          // Check dispute status
          const resolvedStatus = dispute.status === 'won' ? OrderStatus.paid : OrderStatus.refunded;

          await updateOrderStatus(supabase, order.id, resolvedStatus, {
            dispute_id: dispute.id,
            dispute_status: dispute.status,
          });

          console.log(`Dispute resolved (${dispute.status}) for order:`, order.id);
        }

        break;
      }

      // ===== REFUND HANDLING =====

      case "charge.refund.updated": {
        const refund = event.data.object as Stripe.Refund;
        const paymentIntent = refund.payment_intent as string;

        // Find order by payment_intent_id
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_intent_id", paymentIntent)
          .single();

        if (order && refund.status === 'succeeded') {
          await updateOrderStatus(supabase, order.id, OrderStatus.refunded, {
            refund_id: refund.id,
            refunded_amount: refund.amount,
          });

          console.log("Refund processed for order:", order.id, `Amount: ${refund.amount}`);
        }

        break;
      }

      // ===== PAYMENT METHOD TRACKING =====

      case "payment_method.attached": {
        const pm = event.data.object as Stripe.PaymentMethod;

        // Track payment method preferences for analytics
        console.log("Payment method attached:", pm.type, pm.id);
        // TODO: Store customer payment method preferences

        break;
      }

      default:
        console.log("Unhandled webhook event:", event.type);
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("handle-marketplace-webhook error", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
