import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    const { donation_id } = await req.json();

    if (!donation_id) {
      throw new Error("donation_id is required");
    }

    console.log("Sending receipt for donation:", donation_id);

    // Fetch donation details with campaign info
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .select(`
        *,
        funding_campaigns:campaign_id (
          title,
          slug,
          short_description
        )
      `)
      .eq("id", donation_id)
      .single();

    if (donationError || !donation) {
      console.error("Error fetching donation:", donationError);
      throw new Error("Donation not found");
    }

    // Skip email for anonymous donations or missing email
    if (donation.is_anonymous || !donation.donor_email) {
      console.log("Skipping email for anonymous donation or missing email");
      return new Response(
        JSON.stringify({ message: "Skipped email for anonymous donation" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const campaign = donation.funding_campaigns as any;
    const campaignUrl = `${req.headers.get("origin")}/campaigns/${campaign.slug}`;
    const favePoints = donation.fave_points_earned || 0;

    // Generate receipt HTML
    const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donation Receipt</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">❤️</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Thank You for Your Donation!</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Dear ${donation.donor_name},
      </p>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Thank you for your generous donation to <strong>${campaign.title}</strong>. Your support makes a real difference!
      </p>
      
      <!-- Receipt details -->
      <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #111827; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Receipt Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Transaction ID:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right; font-family: monospace;">${donation.payment_reference || donation.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Campaign:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${campaign.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 18px; font-weight: bold; text-align: right;">${donation.amount.toLocaleString('sv-SE')} ${donation.currency}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${new Date(donation.confirmed_at).toLocaleDateString('sv-SE')}</td>
          </tr>
          ${favePoints > 0 ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fave Points Earned:</td>
            <td style="padding: 8px 0; color: #10b981; font-size: 16px; font-weight: bold; text-align: right;">+${favePoints} 🌟</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${donation.message ? `
      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 24px;">
        <p style="color: #065f46; font-size: 14px; margin: 0; font-style: italic;">
          "${donation.message}"
        </p>
      </div>
      ` : ''}
      
      <!-- Call to action -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${campaignUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Campaign
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
        Your contribution helps us achieve our mission. If you have any questions about your donation, please don't hesitate to reach out.
      </p>
      
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 24px;">
        With gratitude,<br>
        <strong>The Zeppel Inn Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
        This is an automated receipt for your donation. Please keep it for your records.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Zeppel Inn. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Zeppel Inn <onboarding@resend.dev>",
      to: [donation.donor_email],
      subject: `Thank you for your donation to ${campaign.title}`,
      html: receiptHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending receipt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
