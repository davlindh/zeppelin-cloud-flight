import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

    const { userId, eventId, orderId } = await req.json();

    // Get user details
    const { data: { user } } = await supabaseClient.auth.admin.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    const eventDate = new Date(event.starts_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const eventTime = new Date(event.starts_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send confirmation email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Gröna Huset × Zeppel Inn <events@gronahuset.se>',
        to: [user.email],
        subject: `Event Confirmation: ${event.title}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">🎟️ Event Confirmed!</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">You're registered for ${event.title}</h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #333;">Event Details</h3>
                  <p><strong>📅 Date:</strong> ${eventDate}</p>
                  <p><strong>⏰ Time:</strong> ${eventTime}</p>
                  ${event.venue ? `<p><strong>📍 Venue:</strong> ${event.venue}</p>` : ''}
                  ${event.location ? `<p><strong>🗺️ Location:</strong> ${event.location}</p>` : ''}
                </div>

                ${event.description ? `
                  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">About the Event</h3>
                    <p>${event.description}</p>
                  </div>
                ` : ''}

                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #333;">What to Bring</h3>
                  <ul>
                    <li>Your ticket confirmation (this email)</li>
                    <li>Valid ID</li>
                    <li>Enthusiasm and an open mind! 🌱</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #666; font-size: 14px;">Order Reference: ${orderId}</p>
                </div>

                <div style="border-top: 2px solid #e0e0e0; padding-top: 20px; margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
                  <p>Questions? Contact us at events@gronahuset.se</p>
                  <p>Gröna Huset × Zeppel Inn</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    console.log('Event confirmation email sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
