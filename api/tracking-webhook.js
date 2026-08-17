// Real-Time Logistics & Tracking Webhook Receiver for Shiprocket Tracking Events
// Endpoint: https://msr-next-gen-tracker.vercel.app/api/tracking-webhook

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'MSR Next Gen Tracking Webhook Listener',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      let payload = req.body;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch (e) {}
      }

      if (!payload) {
        return res.status(200).json({ status: 'ok', message: 'Empty payload received' });
      }

      // Extract tracking details
      const awb = payload.awb ? String(payload.awb) : null;
      const orderId = payload.order_id ? String(payload.order_id) : null;
      const channelOrderId = payload.channel_order_id ? String(payload.channel_order_id) : null;
      const currentStatus = (payload.current_status || payload.shipment_status || '').trim();
      const statusUpper = currentStatus.toUpperCase();
      const courierName = payload.courier_name || 'Courier Partner';

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
        notes: `Logistics (${courierName} AWB: ${awb || 'N/A'}): ${scanNote}`
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
        await supabase
          .from('amparo_calls')
          .update(updateFields)
          .or(conditions.join(','));
      }

      return res.status(200).json({
        success: true,
        message: 'Tracking status received and processed by MSR Next Gen.',
        parsed: {
          awb,
          orderId,
          channelOrderId,
          status: currentStatus,
          isUrgentRto
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
