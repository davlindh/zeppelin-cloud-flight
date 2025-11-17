import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId } = await req.json();

    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Get order items
    const { data: orderItems, error: itemsError } = await supabaseClient
      .from('order_items')
      .select('item_id, item_type, quantity')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    // Check if any items are event tickets
    for (const item of orderItems) {
      if (item.item_type === 'product') {
        // Check if this product is an event ticket
        const { data: product } = await supabaseClient
          .from('products')
          .select('event_id, title')
          .eq('id', item.item_id)
          .eq('product_type', 'event_ticket')
          .single();

        if (product && product.event_id) {
          console.log(`Creating event registration for event ${product.event_id}`);

          // Check if user already has a registration for this event
          const { data: existingReg } = await supabaseClient
            .from('event_registrations')
            .select('id')
            .eq('event_id', product.event_id)
            .eq('user_id', order.user_id)
            .single();

          if (!existingReg) {
            // Create event registration
            const { error: regError } = await supabaseClient
              .from('event_registrations')
              .insert({
                event_id: product.event_id,
                user_id: order.user_id,
                status: 'confirmed',
                note: `Ticket purchased: ${product.title}`,
              });

            if (regError) {
              console.error('Failed to create registration:', regError);
            } else {
              console.log('Successfully created event registration');
              
              // Send confirmation email
              await supabaseClient.functions.invoke('send-event-confirmation', {
                body: {
                  userId: order.user_id,
                  eventId: product.event_id,
                  orderId: orderId,
                },
              });
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
