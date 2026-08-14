// Netlify Serverless Function: Direct Shiprocket API Order Importer & Token Authenticator
// Endpoint: https://msrnext.netlify.app/api/shiprocket-fetch

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
    let token = '';
    let rawCsvOrders = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        email = body.email || '';
        password = body.password || '';
        token = body.token || '';
        rawCsvOrders = body.csvOrders || null;
      } catch (e) {}
    }

    // 1. If CSV orders provided directly from Shiprocket Order Export
    if (Array.isArray(rawCsvOrders) && rawCsvOrders.length > 0) {
      const mappedOrders = rawCsvOrders.map((row, idx) => {
        const orderId = String(row['Order ID'] || row['order_id'] || row['Channel Order ID'] || `SR_${Date.now()}_${idx}`);
        const customer = row['Customer Name'] || row['customer_name'] || row['Billing Name'] || 'Customer';
        const phone = String(row['Customer Phone'] || row['customer_phone'] || row['Mobile'] || row['Phone'] || '9876543210');
        const status = String(row['Status'] || row['Order Status'] || 'In Transit');
        const awb = String(row['AWB'] || row['awb'] || row['Tracking No'] || '');
        const amount = Number(row['Order Total'] || row['Amount'] || row['total'] || 1499);
        const product = row['Product Name'] || row['Product'] || 'Amparo Pure Shilajit (30g)';
        const courier = row['Courier Name'] || row['Courier'] || 'Delhivery / Bluedart';

        const statusUpper = status.toUpperCase();
        const isRto = statusUpper.includes('RTO') || statusUpper.includes('UNDELIVERED') || statusUpper.includes('FAILED');
        const isDelivered = statusUpper.includes('DELIVERED');

        return {
          shopify_order_id: orderId,
          customer_name: customer,
          phone: phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`,
          city: row['City'] || 'India',
          product,
          amount,
          status: isDelivered ? 'confirmed' : isRto ? 'rto_attempted' : 'pending_confirmation',
          urgent_rto: isRto,
          call_type: isRto ? 'RTO Rescue' : isDelivered ? 'Delivery Feedback' : 'Order Confirmation',
          shiprocket_shipment_id: awb || orderId,
          notes: `Status: ${status} | Courier: ${courier} | AWB: ${awb || 'N/A'}`
        };
      });

      for (const ord of mappedOrders) {
        await supabase.from('amparo_calls').upsert(ord, { onConflict: 'shopify_order_id' });
      }

      return new Response(
        JSON.stringify({
          success: true,
          count: mappedOrders.length,
          orders: mappedOrders
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 2. Authenticate with Shiprocket API Token or Email/Password
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
            message: authData.message || 'Shiprocket login failed. Aap Shiprocket API Token ya Order Export CSV use kar sakte hain.'
          }),
          { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Kripya Shiprocket API Token enter karein ya CSV upload karein.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // 3. Fetch Orders using Bearer Token
    const ordersRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders?per_page=100', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      }
    });

    const ordersData = await ordersRes.json();
    const rawOrders = ordersData?.data || [];

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
        customer_name: order.customer_name || 'Customer',
        phone: String(order.customer_phone || order.customer_mobile || '+919876543210'),
        city: order.customer_city || 'India',
        product: items,
        amount: Number(order.total) || 1499,
        status: isDelivered ? 'confirmed' : isRto ? 'rto_attempted' : 'pending_confirmation',
        urgent_rto: isRto,
        call_type: isRto ? 'RTO Rescue' : isDelivered ? 'Delivery Feedback' : 'Order Confirmation',
        shiprocket_shipment_id: order.shipments && order.shipments[0] ? String(order.shipments[0].awb) : String(order.id),
        notes: `Status: ${order.status} | Courier: ${order.courier_name || 'Courier'} | AWB: ${order.shipments && order.shipments[0] ? order.shipments[0].awb : 'N/A'}`
      };
    });

    for (const ord of mappedOrders) {
      await supabase.from('amparo_calls').upsert(ord, { onConflict: 'shopify_order_id' });
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
