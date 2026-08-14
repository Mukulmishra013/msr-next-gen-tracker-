// Netlify Serverless Function: Direct Shiprocket API Order Importer
// Endpoint: https://msrnext.netlify.app/api/shiprocket-fetch
// Authenticates with Shiprocket API v2 and pulls all existing orders into Supabase & UI

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

  try {
    let email = '';
    let password = '';
    let apiToken = '';

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        email = body.email || '';
        password = body.password || '';
        apiToken = body.token || '';
      } catch (e) {}
    }

    let token = apiToken;

    // 1. If email & password provided, authenticate with Shiprocket to get JWT token
    if (!token && email && password) {
      const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const authData = await authRes.json();
      if (authData && authData.token) {
        token = authData.token;
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: authData.message || 'Shiprocket login failed. Please check email and password.'
          }),
          { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    // If no direct token, fetch orders using token
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Please provide Shiprocket Email & Password or API Token to sync existing orders.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 2. Fetch existing orders from Shiprocket
    const ordersRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders?per_page=50', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const ordersData = await ordersRes.json();
    const rawOrders = ordersData?.data || [];

    // 3. Map Shiprocket orders to Amparo Calls / Order Ledger Schema
    const mappedOrders = rawOrders.map((order) => {
      const isRto =
        String(order.status).toUpperCase().includes('RTO') ||
        String(order.status).toUpperCase().includes('UNDELIVERED');
      const isDelivered = String(order.status).toUpperCase().includes('DELIVERED');

      const items = Array.isArray(order.products) && order.products.length > 0
        ? order.products.map((p) => `${p.name} (x${p.quantity})`).join(', ')
        : 'Amparo Pure Shilajit (30g)';

      return {
        shopify_order_id: String(order.channel_order_id || order.id || ''),
        customer_name: order.customer_name || `${order.customer_name || 'Customer'}`,
        phone: order.customer_phone || order.customer_mobile || '+919876543210',
        city: order.customer_city || 'India',
        product: items,
        amount: Number(order.total) || 1499,
        status: isDelivered ? 'confirmed' : isRto ? 'rto_attempted' : 'pending_confirmation',
        urgent_rto: isRto,
        call_type: isRto ? 'RTO Rescue' : isDelivered ? 'Delivery Feedback' : 'Order Confirmation',
        shiprocket_shipment_id: order.shipments && order.shipments[0] ? String(order.shipments[0].awb) : String(order.id),
        notes: `Status: ${order.status} | Courier: ${order.courier_name || 'Assigned Courier'} | AWB: ${order.shipments && order.shipments[0] ? order.shipments[0].awb : 'N/A'}`
      };
    });

    // 4. Save/Update records in Supabase
    if (mappedOrders.length > 0) {
      for (const ord of mappedOrders) {
        await supabase.from('amparo_calls').upsert(ord, { onConflict: 'shopify_order_id' });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: mappedOrders.length,
        orders: mappedOrders,
        token: token
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
};
