// Netlify Serverless Function: Shiprocket Webhook Receiver
// Endpoint: https://your-netlify-site.netlify.app/api/shiprocket-sync
// Automatically syncs Shiprocket Tracking Status with Amparo Calls Queue

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload = await req.json();

    // Extract Shiprocket tracking details
    const awb = payload.awb ? String(payload.awb) : null;
    const orderId = payload.order_id ? String(payload.order_id) : null;
    const channelOrderId = payload.channel_order_id ? String(payload.channel_order_id) : null;
    const currentStatus = (payload.current_status || payload.shipment_status || '').trim();
    const statusUpper = currentStatus.toUpperCase();
    const courierName = payload.courier_name || 'Shiprocket Courier';

    // Scan info
    const latestScan = Array.isArray(payload.scans) && payload.scans.length > 0 ? payload.scans[0] : null;
    const scanNote = latestScan ? `[${latestScan.location || 'Hub'}]: ${latestScan.activity || currentStatus}` : currentStatus;

    // Check if RTO or Undelivered
    const isUrgentRto =
      statusUpper.includes('RTO') ||
      statusUpper.includes('UNDELIVERED') ||
      statusUpper.includes('FAILED') ||
      statusUpper.includes('CHARGES PENDING') ||
      statusUpper.includes('CUSTOMER REFUSED');

    const isDelivered = statusUpper.includes('DELIVERED') && !statusUpper.includes('RTO DELIVERED');

    const updateFields = {
      notes: `Shiprocket (${courierName} AWB: ${awb || 'N/A'}): ${scanNote}`
    };

    if (awb) {
      updateFields.shiprocket_shipment_id = awb;
    }

    if (isUrgentRto) {
      updateFields.urgent_rto = true;
      updateFields.call_type = 'RTO Rescue';
    } else if (isDelivered) {
      updateFields.urgent_rto = false;
      updateFields.status = 'confirmed';
      updateFields.call_type = 'Delivery Feedback';
    }

    // Update record in Supabase
    const conditions = [];
    if (channelOrderId) conditions.push(`shopify_order_id.eq.${channelOrderId}`);
    if (channelOrderId && !channelOrderId.startsWith('#')) conditions.push(`shopify_order_id.eq.#${channelOrderId}`);
    if (orderId) conditions.push(`shopify_order_id.eq.${orderId}`);
    if (awb) conditions.push(`shiprocket_shipment_id.eq.${awb}`);

    if (conditions.length > 0) {
      const { data, error } = await supabase
        .from('amparo_calls')
        .update(updateFields)
        .or(conditions.join(','));

      if (error) {
        console.error('Supabase update error:', error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Shiprocket tracking status received and processed by MSR Next Gen.',
        parsed: {
          awb,
          currentStatus,
          isUrgentRto,
          isDelivered
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
