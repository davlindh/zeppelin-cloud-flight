import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  providerId: string;
  type: 'message' | 'booking' | 'review' | 'inquiry';
  data: {
    customerName?: string;
    customerEmail?: string;
    message?: string;
    serviceName?: string;
    rating?: number;
    bookingDate?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user and admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { p_user_id: user.id, p_role: 'admin' });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { providerId, type, data }: NotificationRequest = await req.json();
    
    console.log(`Processing ${type} notification for provider ${providerId}`);

    // Get provider details and preferences
    const { data: provider, error: providerError } = await supabase
      .from('service_providers')
      .select(`
        id,
        name,
        email,
        notification_preferences:provider_notification_preferences(
          email_on_message,
          email_on_booking,
          email_on_review,
          email_on_inquiry
        )
      `)
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      console.error('Provider not found:', providerError);
      return new Response(
        JSON.stringify({ error: "Provider not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if provider wants this type of notification
    const prefs = provider.notification_preferences?.[0];
    const shouldSend = 
      (type === 'message' && prefs?.email_on_message !== false) ||
      (type === 'booking' && prefs?.email_on_booking !== false) ||
      (type === 'review' && prefs?.email_on_review !== false) ||
      (type === 'inquiry' && prefs?.email_on_inquiry !== false);

    if (!shouldSend) {
      console.log(`Notifications disabled for ${type}`);
      return new Response(
        JSON.stringify({ success: true, message: "Notifications disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate email content based on type
    let subject = '';
    let html = '';

    switch (type) {
      case 'message':
        subject = `Nytt meddelande från ${data.customerName || 'en kund'}`;
        html = `
          <h2>Hej ${provider.name}!</h2>
          <p>Du har fått ett nytt meddelande från <strong>${data.customerName || 'en kund'}</strong>.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Från:</strong> ${data.customerEmail}</p>
            <p><strong>Meddelande:</strong></p>
            <p>${data.message || 'Inget meddelande'}</p>
          </div>
          <p>Logga in för att svara: <a href="${supabaseUrl}/admin/messages">Se meddelanden</a></p>
        `;
        break;

      case 'booking':
        subject = `Ny bokning${data.serviceName ? ` för ${data.serviceName}` : ''}`;
        html = `
          <h2>Hej ${provider.name}!</h2>
          <p>Du har fått en ny bokning!</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${data.serviceName ? `<p><strong>Tjänst:</strong> ${data.serviceName}</p>` : ''}
            ${data.bookingDate ? `<p><strong>Datum:</strong> ${data.bookingDate}</p>` : ''}
            <p><strong>Kund:</strong> ${data.customerName || 'Okänd'}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
          </div>
          <p>Logga in för att se detaljer: <a href="${supabaseUrl}/admin/bookings">Se bokningar</a></p>
        `;
        break;

      case 'review':
        const stars = '⭐'.repeat(data.rating || 5);
        subject = `Ny recension ${stars}`;
        html = `
          <h2>Hej ${provider.name}!</h2>
          <p>Du har fått en ny recension!</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Betyg:</strong> ${stars} (${data.rating}/5)</p>
            <p><strong>Från:</strong> ${data.customerName || 'Anonym'}</p>
            ${data.message ? `<p><strong>Kommentar:</strong> ${data.message}</p>` : ''}
          </div>
          <p>Logga in för att svara: <a href="${supabaseUrl}/providers/portfolio">Se recensioner</a></p>
        `;
        break;

      case 'inquiry':
        subject = `Ny förfrågan från ${data.customerName || 'en kund'}`;
        html = `
          <h2>Hej ${provider.name}!</h2>
          <p>Du har fått en ny förfrågan!</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            ${data.serviceName ? `<p><strong>Gällande:</strong> ${data.serviceName}</p>` : ''}
            <p><strong>Från:</strong> ${data.customerName || 'Okänd'}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            ${data.message ? `<p><strong>Meddelande:</strong> ${data.message}</p>` : ''}
          </div>
          <p>Svara snabbt för att öka dina chanser att få uppdraget!</p>
        `;
        break;
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Service Marketplace <onboarding@resend.dev>",
      to: [provider.email],
      subject: subject,
      html: html,
    });

    console.log(`Email sent to ${provider.email}:`, emailResponse);

    const messageId = 'data' in emailResponse && emailResponse.data ? emailResponse.data.id : 'sent';
    return new Response(
      JSON.stringify({ success: true, messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error sending notification:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
