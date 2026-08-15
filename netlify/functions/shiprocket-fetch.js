// Netlify Serverless Function: Direct Shiprocket Multi-Page Full 900+ Orders Importer & CSV Parser
// Endpoint: https://msrnext.netlify.app/api/shiprocket-fetch

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const DEFAULT_SHIPROCKET_EMAIL = 'atulmishra9506348351@gmail.com';
const DEFAULT_SHIPROCKET_PASS = '^zCGyq0I%uoef9Syy98qdZm*Z4h4ntQC';

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
    let rawCsvOrders = null;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.email) email = body.email.trim();
        if (body.password) password = body.password.trim();
        if (body.token) token = body.token.trim();
        if (body.csvOrders) rawCsvOrders = body.csvOrders;
      } catch (e) {}
    }

    // 1. If CSV Orders uploaded directly from Shiprocket Order Export
    if (Array.isArray(rawCsvOrders) && rawCsvOrders.length > 0) {
      const mappedOrders = rawCsvOrders.map((row, idx) => {
        const orderId = String(
          row['Order ID'] ||
          row['order_id'] ||
          row['Channel Order ID'] ||
          row['Order Id'] ||
          `SR_${Date.now()}_${idx}`
        );

        const customer = row['Customer Name'] || row['customer_name'] || row['Billing Name'] || row['Consignee Name'] || 'Customer';
        
        const rawPhone = String(
          row['Customer Phone'] ||
          row['customer_phone'] ||
          row['Mobile'] ||
          row['Phone'] ||
          row['Billing Phone'] ||
          row['Delivery Phone'] ||
          row['Consignee Mobile'] ||
          ''
        );

        const cleanDigits = rawPhone.replace(/\D/g, '');
        const validPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : '+91';

        const status = String(row['Status'] || row['Order Status'] || row['Shipment Status'] || 'In Transit');
        const awb = String(row['AWB'] || row['awb'] || row['Tracking No'] || row['AWB Code'] || '');
        const amount = Number(row['Order Total'] || row['Amount'] || row['total'] || row['Total'] || 588);
        const product = row['Product Name'] || row['Product'] || row['Items'] || 'Amparo Pure Shilajit (30g)';
        const courier = row['Courier Name'] || row['Courier'] || 'Assigned Courier';
        const city = row['City'] || row['Customer City'] || row['Destination City'] || 'India';
        const createdAt = row['Created Date'] || row['Order Date'] || row['Date'] || new Date().toISOString();

        const statusUpper = status.toUpperCase();
        const isRto = statusUpper.includes('RTO') || statusUpper.includes('UNDELIVERED') || statusUpper.includes('FAILED');
        const isDelivered = statusUpper.includes('DELIVERED');
        const isCancelled = statusUpper.includes('CANCEL');

        return {
          shopify_order_id: orderId,
          customer_name: customer,
          phone: validPhone,
          product,
          amount,
          status: isDelivered ? 'confirmed' : (isRto ? 'rto_attempted' : (isCancelled ? 'rto_lost' : 'pending_confirmation')),
          urgent_rto: isRto,
          call_type: isRto ? 'RTO Rescue' : (isDelivered ? 'Old Customer Feedback' : 'Order Confirmation'),
          shiprocket_shipment_id: awb || orderId,
          created_at: createdAt,
          notes: `Status: ${status} | City: ${city} | Courier: ${courier} | AWB: ${awb || 'N/A'}`
        };
      });

      if (mappedOrders.length > 0) {
        await supabase.from('amparo_calls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // Chunk insert 100 at a time for large datasets
        for (let i = 0; i < mappedOrders.length; i += 100) {
          await supabase.from('amparo_calls').insert(mappedOrders.slice(i, i + 100));
        }
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

    // 2. Otherwise fetch from Shiprocket REST API Multi-Page Pagination
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

    // Fetch All Pages (up to 1000 orders)
    let allRawOrders = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      try {
        const ordersRes = await fetch(`https://apiv2.shiprocket.in/v1/external/orders?page=${page}&per_page=100`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const ordersData = await ordersRes.json();
        const pageOrders = ordersData?.data || [];

        if (Array.isArray(pageOrders) && pageOrders.length > 0) {
          allRawOrders = allRawOrders.concat(pageOrders);
          if (pageOrders.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (e) {
        hasMore = false;
      }
    }

    const mappedOrders = allRawOrders.map((o) => {
      const statusStr = String(o.status || '').toUpperCase();
      const isRto = statusStr.includes('RTO') || statusStr.includes('UNDELIVERED') || statusStr.includes('FAILED');
      const isDelivered = statusStr.includes('DELIVERED');
      const isCancelled = statusStr.includes('CANCEL');

      const items = Array.isArray(o.products) && o.products.length > 0
        ? o.products.map((p) => p.name).join(', ')
        : (o.others && o.others.order_items && o.others.order_items[0] ? o.others.order_items[0].name : 'Amparo Pure Shilajit');

      const rawPhone = String(
        o.customer_phone ||
        o.customer_mobile ||
        o.customer_alternate_phone ||
        (o.others && o.others.billing_phone) ||
        (o.others && o.others.billing_phone_number) ||
        ''
      );

      const cleanDigits = rawPhone.replace(/\D/g, '');
      const validPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : '+91';
      const custName = o.customer_name || (o.others && o.others.billing_name) || 'Customer';
      const awb = o.shipments && o.shipments[0] ? String(o.shipments[0].awb) : '';
      const courier = o.shipments && o.shipments[0] ? String(o.shipments[0].courier_name || 'Courier') : 'Assigned Courier';
      const city = o.customer_city || (o.others && o.others.billing_city) || 'India';

      return {
        shopify_order_id: String(o.channel_order_id || (o.others && o.others.name) || o.id),
        customer_name: custName === 'Not Authorized' ? 'Verified Buyer' : custName,
        phone: validPhone,
        product: items,
        amount: Number(o.total || (o.others && o.others.subtotal_price) || 588),
        status: isDelivered ? 'confirmed' : (isRto ? 'rto_attempted' : (isCancelled ? 'rto_lost' : 'pending_confirmation')),
        urgent_rto: isRto,
        call_type: isRto ? 'RTO Rescue' : (isDelivered ? 'Old Customer Feedback' : 'Order Confirmation'),
        shiprocket_shipment_id: awb || String(o.id),
        created_at: o.created_at || new Date().toISOString(),
        notes: `Status: ${o.status || 'Active'} | City: ${city} | Courier: ${courier} | AWB: ${awb || 'Pending'}`
      };
    });

    if (mappedOrders.length > 0) {
      await supabase.from('amparo_calls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // Chunk insert in batches of 100
      for (let i = 0; i < mappedOrders.length; i += 100) {
        await supabase.from('amparo_calls').insert(mappedOrders.slice(i, i + 100));
      }
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
