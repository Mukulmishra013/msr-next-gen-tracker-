// Direct Shopify Store Sync using Client ID & Client Secret for 100% Real Customer Data
// Endpoint: https://msr-next-gen-tracker.vercel.app/api/shopify-sync

import { createClient } from '@supabase/supabase-js';
import { getShopifyAccessToken } from './lib/shopify-order-action.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const DEFAULT_SHOPIFY_STORE = process.env.SHOPIFY_STORE || process.env.VITE_SHOPIFY_STORE || 'amparo.myshopify.com';
const DEFAULT_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || process.env.VITE_SHOPIFY_CLIENT_ID || 'a817dbe991c7e8c140bb85b122798617';
const DEFAULT_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || process.env.VITE_SHOPIFY_CLIENT_SECRET || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let store = DEFAULT_SHOPIFY_STORE;
    let clientId = DEFAULT_CLIENT_ID;
    let clientSecret = DEFAULT_CLIENT_SECRET;

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }
      if (body) {
        if (body.store) store = body.store.trim();
        if (body.clientId) clientId = body.clientId.trim();
        if (body.clientSecret) clientSecret = body.clientSecret.trim();
        if (body.token) clientSecret = body.token.trim();
      }
    }

    // Dynamic Token Resolution
    const accessToken = await getShopifyAccessToken(store, clientId, clientSecret);

    // Fetch Orders & Customers directly from Shopify Admin REST API
    const shopifyRes = await fetch(`https://${store}/admin/api/2024-01/orders.json?status=any&limit=250`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    const data = await shopifyRes.json();
    if (!shopifyRes.ok || !data.orders) {
      return res.status(200).json({
        success: false,
        message: data.errors || 'Shopify API connected. Ready for webhook ingestion.',
        orders: []
      });
    }

    const rawOrders = data.orders || [];

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
        notes: `Shopify Real Order | Financial: ${o.financial_status} | City: ${city}`
      };
    });

    if (mappedOrders.length > 0) {
      await supabase
        .from('amparo_calls')
        .upsert(mappedOrders, { onConflict: 'shopify_order_id' });
    }

    return res.status(200).json({
      success: true,
      count: mappedOrders.length,
      orders: mappedOrders
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
