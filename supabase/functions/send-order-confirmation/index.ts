import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

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

    const { orderId, customerEmail, customerName }: OrderConfirmationRequest = await req.json();

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          item_title,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Format order items for email
    const itemsHtml = order.order_items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.item_title} x ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${(item.total_price || 0).toFixed(0)} kr
          </td>
        </tr>
      `
      )
      .join("");

    const shippingAddress = order.shipping_address as any;
    const addressHtml = shippingAddress
      ? `
        <p style="margin: 8px 0; color: #6b7280;">
          ${order.customer_name}<br/>
          ${shippingAddress.address || ""}<br/>
          ${shippingAddress.postalCode || ""} ${shippingAddress.city || ""}<br/>
          ${shippingAddress.country || ""}
        </p>
      `
      : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; padding: 20px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
            </div>
            
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">
                Hi ${customerName},
              </p>
              
              <p style="font-size: 16px; color: #1f2937; margin-bottom: 24px;">
                Thank you for your order! We've received your payment and are processing your order.
              </p>

              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
                <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #1f2937;">
                  ${order.order_number}
                </p>
              </div>

              <h2 style="font-size: 18px; color: #1f2937; margin-bottom: 16px;">Order Details</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 12px; font-weight: bold;">Subtotal</td>
                    <td style="padding: 12px; text-align: right;">${(order.subtotal || 0).toFixed(0)} kr</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px;">Tax</td>
                    <td style="padding: 12px; text-align: right;">${(order.tax_amount || 0).toFixed(0)} kr</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px;">Shipping</td>
                    <td style="padding: 12px; text-align: right;">${(order.shipping_amount || 0).toFixed(0)} kr</td>
                  </tr>
                  <tr style="background: #f3f4f6;">
                    <td style="padding: 12px; font-weight: bold; font-size: 18px;">Total</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">
                      ${(order.total_amount || 0).toFixed(0)} kr
                    </td>
                  </tr>
                </tbody>
              </table>

              ${
                addressHtml
                  ? `
              <h2 style="font-size: 18px; color: #1f2937; margin-bottom: 16px;">Shipping Address</h2>
              ${addressHtml}
              `
                  : ""
              }

              <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  If you have any questions, please reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Order Confirmation <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order Confirmation - ${order.order_number}`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent:", emailResponse);

    const emailId = 'data' in emailResponse && emailResponse.data ? emailResponse.data.id : 'sent';
    return new Response(JSON.stringify({ success: true, emailId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending order confirmation:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
