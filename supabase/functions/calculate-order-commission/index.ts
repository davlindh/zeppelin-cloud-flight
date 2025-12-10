import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommissionRate {
  rate: number;
  source: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('Calculating commission for order:', orderId);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, event_id')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    console.log(`Processing ${orderItems?.length || 0} order items`);

    // Get all commission settings
    const { data: commissionSettings, error: settingsError } = await supabase
      .from('commission_settings')
      .select('*')
      .eq('is_active', true);

    if (settingsError) throw settingsError;

    const breakdown = [];
    let totalCommission = 0;

    // Process each order item
    for (const item of orderItems || []) {
      // Get product details
      const { data: product } = await supabase
        .from('products')
        .select('seller_id, category_id, commission_rate')
        .eq('id', item.item_id)
        .single();

      // Determine applicable commission rate using hierarchy
      const commissionRate = await getCommissionRate(
        commissionSettings || [],
        {
          productId: item.item_id,
          sellerId: product?.seller_id,
          eventId: order.event_id,
          categoryId: product?.category_id,
          productCommissionRate: product?.commission_rate,
        }
      );

      const commissionAmount = item.total_price * (commissionRate.rate / 100);

      // Update order item with commission data
      await supabase
        .from('order_items')
        .update({
          commission_rate: commissionRate.rate,
          commission_amount: commissionAmount,
          seller_id: product?.seller_id,
        })
        .eq('id', item.id);

      totalCommission += commissionAmount;

      breakdown.push({
        itemId: item.id,
        itemTitle: item.item_title,
        rate: commissionRate.rate,
        source: commissionRate.source,
        amount: commissionAmount,
      });

      console.log(
        `Item ${item.item_title}: ${commissionRate.rate}% (${commissionRate.source}) = ${commissionAmount.toFixed(2)} kr`
      );
    }

    // Update order with total commission
    await supabase
      .from('orders')
      .update({ total_commission: totalCommission })
      .eq('id', orderId);

    console.log(`Total commission for order: ${totalCommission.toFixed(2)} kr`);

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        totalCommission,
        breakdown,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Commission calculation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getCommissionRate(
  settings: any[],
  context: {
    productId: string;
    sellerId?: string;
    eventId?: string;
    categoryId?: string;
    productCommissionRate?: number;
  }
): Promise<CommissionRate> {
  // 1. Product-specific override
  if (context.productCommissionRate !== null && context.productCommissionRate !== undefined) {
    return { rate: context.productCommissionRate, source: 'product' };
  }

  // 2. Product-type rule
  const productRule = settings.find(
    (s) => s.rule_type === 'product_type' && s.reference_id === context.productId
  );
  if (productRule) {
    return { rate: productRule.commission_rate, source: 'product_rule' };
  }

  // 3. Seller-specific rule
  if (context.sellerId) {
    const sellerRule = settings.find(
      (s) => s.rule_type === 'seller' && s.reference_id === context.sellerId
    );
    if (sellerRule) {
      return { rate: sellerRule.commission_rate, source: 'seller' };
    }
  }

  // 4. Event-specific rule
  if (context.eventId) {
    const eventRule = settings.find(
      (s) => s.rule_type === 'event' && s.reference_id === context.eventId
    );
    if (eventRule) {
      return { rate: eventRule.commission_rate, source: 'event' };
    }
  }

  // 5. Category-specific rule
  if (context.categoryId) {
    const categoryRule = settings.find(
      (s) => s.rule_type === 'category' && s.reference_id === context.categoryId
    );
    if (categoryRule) {
      return { rate: categoryRule.commission_rate, source: 'category' };
    }
  }

  // 6. Default platform rate
  const defaultRule = settings.find((s) => s.rule_type === 'default');
  if (defaultRule) {
    return { rate: defaultRule.commission_rate, source: 'default' };
  }

  // Fallback to 10% if no rules found
  return { rate: 10, source: 'fallback' };
}
