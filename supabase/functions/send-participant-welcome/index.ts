import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  submissionId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { submissionId }: RequestBody = await req.json();

    console.log("📧 Processing participant welcome email for submission:", submissionId);

    const { data: createResult, error: createError } = await supabase
      .rpc("create_participant_from_submission", { _submission_id: submissionId });

    if (createError || !createResult?.[0]?.success) {
      throw new Error(createResult?.[0]?.message || "Failed to create participant");
    }

    const participantId = createResult[0].participant_id;
    console.log("✅ Participant created:", participantId);

    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("name, contact_email, slug")
      .eq("id", participantId)
      .single();

    if (participantError || !participant) {
      throw new Error("Failed to fetch participant data");
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from("participant_tokens")
      .insert({
        participant_id: participantId,
      })
      .select("token")
      .single();

    if (tokenError || !tokenData) {
      throw new Error("Failed to create token");
    }

    const token = tokenData.token;
    console.log("🔑 Token created:", token);

    const origin = req.headers.get("origin") || "https://paywaomkmjssbtkzwnwd.lovable.app";
    const profileUrl = `${origin}/participant/complete-profile?token=${token}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            ul { padding-left: 20px; }
            li { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Välkommen till Zeppel Inn!</h1>
            </div>
            <div class="content">
              <p>Hej ${participant.name}!</p>
              
              <p>Din deltagaranmälan har <strong>godkänts</strong>! Vi är glada att välkomna dig till Zeppel Inn-gemenskapen.</p>
              
              <p>För att slutföra din profil och bli synlig på vår hemsida behöver du:</p>
              
              <ul>
                <li>✅ Skapa ett konto (om du inte redan har ett)</li>
                <li>✅ Fylla i kompletterande profilinformation</li>
                <li>✅ Ladda upp en profilbild (valfritt men rekommenderat)</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${profileUrl}" class="button">Slutför min profil →</a>
              </p>
              
              <p><small><strong>Observera:</strong> Länken är giltig i 7 dagar. Om den går ut kan du begära en ny via admin@zeppelinn.se.</small></p>
              
              <p>När din profil är klar kommer den att visas på ${origin}/participants</p>
              
              <p>Vi ser fram emot att ha dig med i gemenskapen!</p>
              
              <p>Vänliga hälsningar,<br><strong>Zeppel Inn-teamet</strong></p>
            </div>
            <div class="footer">
              <p>Du får detta mail för att din deltagaranmälan till Zeppel Inn har godkänts.</p>
              <p>Om du inte har ansökt, vänligen ignorera detta mail.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "Zeppel Inn <onboarding@resend.dev>",
      to: [participant.contact_email!],
      subject: "Välkommen till Zeppel Inn - Slutför din profil",
      html: emailHtml,
    });

    if (emailError) {
      console.error("❌ Email send failed:", emailError);
      throw emailError;
    }

    console.log("✅ Welcome email sent to:", participant.contact_email);

    return new Response(
      JSON.stringify({
        success: true,
        participantId,
        message: "Participant created and welcome email sent",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-participant-welcome:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
