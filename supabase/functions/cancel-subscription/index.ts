import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { subscription_id } = await req.json();

    if (!subscription_id) {
      throw new Error("subscription_id is required");
    }

    console.log("Canceling subscription:", subscription_id, "for user:", user.id);

    // Verify user owns the subscription
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: subscription, error: subError } = await supabaseServiceClient
      .from("donation_subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .eq("donor_user_id", user.id)
      .single();

    if (subError || !subscription) {
      throw new Error("Subscription not found or you don't have permission");
    }

    // Cancel in Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Update database
    const { error: updateError } = await supabaseServiceClient
      .from("donation_subscriptions")
      .update({
        cancel_at_period_end: true,
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription_id);

    if (updateError) {
      console.error("Error updating subscription in database:", updateError);
      throw updateError;
    }

    console.log("Subscription canceled successfully:", subscription_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription will be canceled at the end of the current period",
        period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
