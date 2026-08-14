// Netlify Serverless Function: Direct Shiprocket API Order Importer & Auto-Sync
// Endpoint: https://msrnext.netlify.app/api/shiprocket-fetch

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const DEFAULT_SHIPROCKET_EMAIL = 'atulmishra9506348351@gmail.com';
const DEFAULT_SHIPROCKET_PASS = '&XOA567eUlFpJXpHl^5Sw01hhbs9wqiz';

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

  try {
    let email = DEFAULT_SHIPROCKET_EMAIL;
    let password = DEFAULT_SHIPROCKET_PASS;
    let token = '';

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.email) email = body.email.trim();
        if (body.password) password = body.password.trim();
        if (body.token) token = body.token.trim();
      } catch (e) {}
    }

    // 1. Get JWT Token from Shiprocket
    if (!token) {
      const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const authData = await authRes.json();
      if (authData && authData.token) {
        token = authData.token;
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: authData.message || 'Shiprocket authentication failed.'
          }),
          { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    // 2. Fetch Orders from Shiprocket
    const ordersRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders?per_page=100', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const ordersData = await ordersRes.json();
    const rawOrders = ordersData?.data || [];

    const mappedOrders = rawOrders.map((o) => {
      const isRto = String(o.status).toUpperCase().includes('RTO') || String(o.status).toUpperCase().includes('UNDELIVERED');
      const isDelivered = String(o.status).toUpperCase().includes('DELIVERED');

      const items = Array.isArray(o.products) && o.products.length > 0
        ? o.products.map((p) => p.name).join(', ')
        : (o.others && o.others.order_items && o.others.order_items[0] ? o.others.order_items[0].name : 'Amparo Shilajit');

      const phone = o.customer_phone || (o.others && o.others.billing_phone) || '9876543210';
      const custName = o.customer_name || (o.others && o.others.billing_name) || 'Customer';

      return {
        shopify_order_id: String(o.channel_order_id || (o.others && o.others.name) || o.id),
        customer_name: custName === 'Not Authorized' ? 'Verified Buyer' : custName,
        phone: phone.startsWith('+') ? phone : '+91' + phone.replace(/\D/g, '').slice(-10),
        product: items,
        amount: Number(o.total || (o.others && o.others.subtotal_price) || 588),
        status: isDelivered ? 'confirmed' : (isRto ? 'rto_attempted' : 'pending_confirmation'),
        urgent_rto: isRto,
        call_type: isRto ? 'RTO Rescue' : (isDelivered ? 'Delivery Feedback' : 'Order Confirmation'),
        shiprocket_shipment_id: o.shipments && o.shipments[0] ? String(o.shipments[0].awb) : String(o.id),
        notes: 'Status: ' + o.status + ' | City: ' + (o.customer_city || (o.others && o.others.billing_city) || 'India') + ' | AWB: ' + (o.shipments && o.shipments[0] ? o.shipments[0].awb : 'Pending')
      };
    });

    // Delete old data & insert fresh batch
    if (mappedOrders.length > 0) {
      await supabase.from('amparo_calls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('amparo_calls').insert(mappedOrders);
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: mappedOrders.length,
        orders: mappedOrders
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
