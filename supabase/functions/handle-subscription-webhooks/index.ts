import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_SUBSCRIPTION_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      throw new Error("Webhook authentication failed");
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Subscription webhook event:", event.type);

    switch (event.type) {
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const campaignId = subscription.metadata?.campaign_id;
        const donorUserId = subscription.metadata?.donor_user_id;

        if (!campaignId || !donorUserId) {
          console.error("Missing metadata in subscription");
          break;
        }

        // Create subscription record
        const { error } = await supabase
          .from("donation_subscriptions")
          .insert({
            campaign_id: campaignId,
            donor_user_id: donorUserId,
            amount: subscription.items.data[0].price.unit_amount! / 100,
            currency: subscription.currency.toUpperCase(),
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            interval: subscription.items.data[0].price.recurring?.interval || 'month',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        if (error) {
          console.error("Error creating subscription record:", error);
          throw error;
        }

        console.log("Subscription record created:", subscription.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from("donation_subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
          throw error;
        }

        console.log("Subscription updated:", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from("donation_subscriptions")
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error canceling subscription:", error);
          throw error;
        }

        console.log("Subscription canceled:", subscription.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') {
          const subscriptionId = invoice.subscription as string;
          
          // Get subscription details
          const { data: subscription, error: subError } = await supabase
            .from("donation_subscriptions")
            .select("*")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (subError || !subscription) {
            console.error("Subscription not found:", subError);
            break;
          }

          // Get donor email from user
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
            subscription.donor_user_id
          );

          if (userError || !user) {
            console.error("User not found:", userError);
            break;
          }

          // Create donation record for this recurring payment
          const { data: donation, error: donationError } = await supabase
            .from("donations")
            .insert({
              campaign_id: subscription.campaign_id,
              donor_user_id: subscription.donor_user_id,
              donor_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              donor_email: user.email,
              amount: subscription.amount,
              currency: subscription.currency,
              payment_provider: 'stripe',
              payment_reference: invoice.id,
              status: 'succeeded',
              is_anonymous: false,
              is_recurring: true,
              subscription_id: subscriptionId,
              recurrence_interval: subscription.interval,
              confirmed_at: new Date().toISOString(),
              metadata: {
                invoice_id: invoice.id,
                billing_reason: invoice.billing_reason,
              },
            })
            .select()
            .single();

          if (donationError) {
            console.error("Error creating recurring donation:", donationError);
            throw donationError;
          }

          console.log("Recurring donation created:", donation.id);

          // Send receipt email
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-donation-receipt`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ donation_id: donation.id }),
            });
          } catch (emailError) {
            console.error("Error sending receipt email:", emailError);
            // Don't fail the webhook if email fails
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const { error } = await supabase
            .from("donation_subscriptions")
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);

          if (error) {
            console.error("Error updating subscription to past_due:", error);
          }

          console.log("Subscription marked as past_due:", subscriptionId);
        }
        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Subscription webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
