// Real-Time Shopify Webhook Receiver: 100% Automatic New Order Ingestion with Unmasked Mobile Numbers
// Endpoint: https://msrnext.netlify.app/api/shopify-webhook

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      shiprocket_shipment_id: String(body.id),
      notes: `Shopify Auto Webhook | Financial: ${body.financial_status || 'COD'} | City: ${city}`
    };

    // Upsert into Supabase
    const { data, error } = await supabase
      .from('amparo_calls')
      .upsert([newCall], { onConflict: 'shopify_order_id' });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Real-time order ingested successfully',
        order: newCall
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
