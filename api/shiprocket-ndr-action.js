// Shiprocket Direct NDR Courier Re-Attempt & Reschedule Service
// Endpoint: https://msr-next-gen-tracker.vercel.app/api/shiprocket-ndr-action

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const DEFAULT_SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL || process.env.VITE_SHIPROCKET_EMAIL || 'atulmishra9506348351@gmail.com';
const DEFAULT_SHIPROCKET_PASS = process.env.SHIPROCKET_PASSWORD || process.env.VITE_SHIPROCKET_PASSWORD || 'k87oHWzmv6^9u8yxZsur8sw@G$DI0Od0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const {
      awb,
      orderId,
      action = 're-attempt',
      deferred_date,
      comments = 'Customer requested re-attempt, priority delivery confirmed',
      phone,
      address,
      telecallerName = 'Telecaller'
    } = body || {};

    if (!awb && !orderId) {
      return res.status(400).json({ success: false, message: 'AWB or Order ID is required' });
    }

    // 1. Authenticate with Shiprocket API
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DEFAULT_SHIPROCKET_EMAIL,
        password: DEFAULT_SHIPROCKET_PASS
      })
    });

    const authData = await authRes.json();
    const token = authData?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: authData?.message || 'Shiprocket authentication failed'
      });
    }

    // 2. Format tomorrow's date if not provided
    const targetDate = deferred_date || (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })();

    let shiprocketResponse = null;
    let cleanAwb = String(awb || '').trim();

    if (cleanAwb && cleanAwb !== 'Pending' && cleanAwb !== 'N/A') {
      // Call Shiprocket NDR Action Endpoint
      const ndrActionRes = await fetch(`https://apiv2.shiprocket.in/v1/external/ndr/${cleanAwb}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: action === 'rto' ? 'rto' : 're-attempt',
          deferred_date: targetDate,
          comments: comments || 'Customer verified re-attempt',
          phone: phone ? String(phone).replace(/\D/g, '').slice(-10) : undefined,
          address: address || undefined
        })
      });

      shiprocketResponse = await ndrActionRes.json();
    }

    // 3. Update Supabase record
    const updatePayload = {
      status: action === 'rto' ? 'rto_lost' : 'rto_saved',
      urgent_rto: action !== 'rto',
      notes: `[COURIER_ACTION] ${action.toUpperCase()} scheduled for ${targetDate} by ${telecallerName} | Note: ${comments}`
    };

    if (phone) {
      const cleanDigits = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanDigits.length === 10) updatePayload.phone = `+91${cleanDigits}`;
    }

    if (orderId) {
      const cleanId = String(orderId).replace('#', '').trim();
      await supabase
        .from('amparo_calls')
        .update(updatePayload)
        .or(`shopify_order_id.eq.${cleanId},shopify_order_id.eq.#${cleanId}`);
    }

    return res.status(200).json({
      success: true,
      message: `Courier ${action === 'rto' ? 'Return' : 'Re-Attempt'} scheduled successfully for ${targetDate}!`,
      shiprocket: shiprocketResponse,
      scheduledDate: targetDate
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
