// Netlify Serverless Function: Direct Shopify Store Sync for 100% Unmasked Real Customer Mobile Numbers
// Endpoint: https://msrnext.netlify.app/api/shopify-sync

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const SHOPIFY_STORE = 'amparo-store-3405.myshopify.com';

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
    let token = '';
    let store = SHOPIFY_STORE;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.token) token = body.token.trim();
        if (body.store) store = body.store.trim();
      } catch (e) {}
    }

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Shopify Admin API Token (shpat_...) required.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Fetch Orders directly from Shopify Admin API
    const res = await fetch(`https://${store}/admin/api/2024-01/orders.json?status=any&limit=100`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      }
    });

    const data = await res.json();
    if (!res.ok || !data.orders) {
      return new Response(
        JSON.stringify({
          success: false,
          message: data.errors || 'Failed to fetch orders from Shopify API.'
        }),
        { status: res.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const rawOrders = data.orders || [];

    // Map Shopify Orders with 100% Unmasked Real Customer Mobile Numbers
    const mappedOrders = rawOrders.map((o) => {
      const cust = o.customer || {};
      const shipping = o.shipping_address || {};
      const billing = o.billing_address || {};

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
        o.phone ||
        ''
      );

      const cleanDigits = rawPhone.replace(/\D/g, '');
      const validPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : (rawPhone ? rawPhone : '+91');

      const items = Array.isArray(o.line_items) && o.line_items.length > 0
        ? o.line_items.map((i) => `${i.title} (x${i.quantity})`).join(', ')
        : 'Amparo Pure Shilajit (30g)';

      const city = shipping.city || billing.city || 'India';
      const isCancelled = !!o.cancelled_at;
      const isDelivered = o.fulfillment_status === 'fulfilled';

      return {
        shopify_order_id: String(o.name || `#${o.order_number}` || o.id),
        customer_name: fullName,
        phone: validPhone,
        product: items,
        amount: Number(o.total_price || 588),
        status: isCancelled ? 'rto_lost' : (isDelivered ? 'confirmed' : 'pending_confirmation'),
        urgent_rto: isCancelled,
        call_type: isCancelled ? 'RTO Rescue' : (isDelivered ? 'Delivery Feedback' : 'Order Confirmation'),
        shiprocket_shipment_id: String(o.id),
        notes: `Shopify Order: ${o.name} | Financial: ${o.financial_status} | City: ${city}`
      };
    });

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
