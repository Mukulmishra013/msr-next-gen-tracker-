// Real-Time Shopify Webhook Receiver: 100% Automatic New Order Ingestion with Instant Maya AI Voice Call Dispatch
// Endpoint: https://msrnext.netlify.app/api/shopify-webhook

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';
const BOLNA_API_KEY = process.env.BOLNA_API_KEY || process.env.VITE_BOLNA_API_KEY || 'bn-058fb2a67eb74db49a65c1a7fecf8956';
const BOLNA_AGENT_ID = process.env.BOLNA_AGENT_ID || process.env.VITE_BOLNA_AGENT_ID || '111395c5-8b11-462a-bd47-cf51dca0f296';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to trigger autonomous Bolna AI call immediately
async function triggerInstantAiCall({ orderId, phone, customerName, product, amount, city }) {
  try {
    const cleanDigits = String(phone).replace(/\D/g, '');
    const validPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : '';
    if (!validPhone || validPhone.length < 12) return { success: false, reason: 'Invalid Phone Number' };

    let cleanProduct = product || 'Amparo Pure Shilajit';
    const lowerProd = cleanProduct.toLowerCase();
    if (lowerProd.includes('sunscreen') || lowerProd.includes('suncream') || lowerProd.includes('smilika')) {
      cleanProduct = 'Smilika Sunscreen';
    } else if (lowerProd.includes('shilajit') && lowerProd.includes('resin')) {
      cleanProduct = 'Amparo Shilajit Resin';
    } else if (lowerProd.includes('shilajit') || lowerProd.includes('gummies')) {
      cleanProduct = 'Amparo Shilajit Gummies';
    }

    const payload = {
      agent_id: BOLNA_AGENT_ID,
      recipient_phone_number: validPhone,
      user_data: {
        customer_name: customerName || 'Customer',
        product_name: cleanProduct,
        order_amount: String(amount || 449).replace(/\D/g, '') || '449',
        order_id: String(orderId).replace('#', '').trim(),
        delivery_address: city || 'India',
        delivery_timeline: '3 se 4 working days',
        call_purpose: 'ORDER_CONFIRMATION',
        combo_product: 'Amparo Pure Shilajit Resin',
        combo_discount: '₹150'
      }
    };

    const response = await fetch('https://api.bolna.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOLNA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (err) {
    console.error('Bolna auto-call trigger error:', err);
    return { success: false, error: err.message };
  }
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Shopify Webhook Ready' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    if (!body || !body.id) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid payload' }), { status: 400 });
    }

    const orderId = String(body.name || `#${body.order_number}` || body.id);
    const numericShopifyId = String(body.id);
    const shipping = body.shipping_address || {};
    const billing = body.billing_address || {};
    const cust = body.customer || {};

    const fullName = (
      (shipping.first_name ? `${shipping.first_name} ${shipping.last_name || ''}` : '') ||
      (billing.first_name ? `${billing.first_name} ${billing.last_name || ''}` : '') ||
      (cust.first_name ? `${cust.first_name} ${cust.last_name || ''}` : '') ||
      'Customer'
    ).trim();

    const rawPhone = String(
      shipping.phone ||
      billing.phone ||
      cust.phone ||
      body.phone ||
      ''
    );

    const cleanDigits = rawPhone.replace(/\D/g, '');
    const validPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : (rawPhone ? rawPhone : '+91');

    const items = Array.isArray(body.line_items) && body.line_items.length > 0
      ? body.line_items.map((i) => `${i.title} (x${i.quantity})`).join(', ')
      : 'Amparo Pure Shilajit (30g)';

    const city = shipping.city || billing.city || 'India';
    const amount = Number(body.total_price || 588);
    const isCancelled = !!body.cancelled_at;
    const isDelivered = body.fulfillment_status === 'fulfilled';

    const newCall = {
      shopify_order_id: orderId,
      customer_name: fullName,
      phone: validPhone,
      product: items,
      amount: amount,
      status: isCancelled ? 'rto_lost' : (isDelivered ? 'confirmed' : 'pending_confirmation'),
      urgent_rto: isCancelled,
      call_type: isCancelled ? 'RTO Rescue' : (isDelivered ? 'Delivery Feedback' : 'Order Confirmation'),
      shiprocket_shipment_id: numericShopifyId,
      notes: `Shopify Auto Webhook | Financial: ${body.financial_status || 'COD'} | City: ${city} | ShopifyId: ${numericShopifyId}`
    };

    // 1. Upsert into Supabase
    await supabase
      .from('amparo_calls')
      .upsert([newCall], { onConflict: 'shopify_order_id' });

    // 2. Trigger Instant Maya AI Voice Call (if order is pending confirmation & not cancelled)
    let autoCallResult = null;
    if (!isCancelled && !isDelivered && validPhone.length >= 12) {
      autoCallResult = await triggerInstantAiCall({
        orderId,
        phone: validPhone,
        customerName: fullName,
        product: items,
        amount,
        city
      });

      // Update call note with trigger status
      const callLogNote = `[AUTO_AI_TRIGGER] Maya AI Dialed for Order Verification at ${new Date().toISOString()} | BolnaStatus: ${autoCallResult.success ? 'DIALED' : 'FAILED'}`;
      await supabase
        .from('amparo_calls')
        .update({
          notes: `${newCall.notes} | ${callLogNote}`
        })
        .eq('shopify_order_id', orderId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Real-time order ingested and Maya AI auto-call dispatched successfully',
        order: newCall,
        autoCall: autoCallResult
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
};
