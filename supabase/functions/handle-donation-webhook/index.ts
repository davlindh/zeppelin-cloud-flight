// Stub for payment webhook handler
// This will be extended when integrating with Stripe/Swish

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const payload = await req.json();
    console.log('Received webhook:', payload);

    // TODO: Verify webhook signature from payment provider
    // For Stripe: use stripe.webhooks.constructEvent
    // For Swish: verify callback token

    // Extract donation info from payload
    const {
      donation_id,
      payment_reference,
      status, // 'succeeded' | 'failed' | 'refunded'
      provider, // 'stripe' | 'swish' | etc
    } = payload;

    if (!donation_id) {
      throw new Error('Missing donation_id in webhook payload');
    }

    // Update donation status (uses service role, bypasses RLS)
    const { data, error } = await supabase
      .from('donations')
      .update({
        status,
        payment_reference,
        payment_provider: provider,
        confirmed_at: status === 'succeeded' ? new Date().toISOString() : null,
      })
      .eq('id', donation_id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update donation:', error);
      throw error;
    }

    console.log('Donation updated:', data);

    // Trigger will handle Fave Points and campaign updates automatically

    return new Response(
      JSON.stringify({ success: true, donation: data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
