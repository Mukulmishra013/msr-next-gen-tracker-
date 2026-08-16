// Real-Time Shiprocket Webhook Receiver: 100% Automatic Tracking, NDR & RTO Status Updates
// Endpoint: https://msrnext.netlify.app/api/shiprocket-webhook

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
    return new Response(JSON.stringify({ message: 'Shiprocket Webhook Ready' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const orderId = String(body.order_id || body.channel_order_id || '');
    const currentStatus = String(body.current_status || body.status || '').toUpperCase();
    const awb = String(body.awb || body.shipment_id || '');

    const isRto = currentStatus.includes('RTO') || currentStatus.includes('UNDELIVERED') || currentStatus.includes('FAILED');
    const isDelivered = currentStatus.includes('DELIVERED');

    if (orderId) {
      await supabase
        .from('amparo_calls')
        .update({
          status: isDelivered ? 'confirmed' : (isRto ? 'rto_attempted' : 'pending_confirmation'),
          urgent_rto: isRto,
          notes: `Live SR Webhook | Status: ${currentStatus} | AWB: ${awb}`
        })
        .or(`shopify_order_id.eq.${orderId},shopify_order_id.eq.#${orderId}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
};
