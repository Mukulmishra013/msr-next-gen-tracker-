// Direct Shiprocket Live Orders & Historical Archive Sync Serverless Function
// Endpoint: https://msr-next-gen-tracker.vercel.app/api/shiprocket-fetch

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const DEFAULT_SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL || process.env.VITE_SHIPROCKET_EMAIL || 'atulmishra9506348351@gmail.com';
const DEFAULT_SHIPROCKET_PASS = process.env.SHIPROCKET_PASSWORD || process.env.VITE_SHIPROCKET_PASSWORD || 'k87oHWzmv6^9u8yxZsur8sw@G$DI0Od0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let email = DEFAULT_SHIPROCKET_EMAIL;
    let password = DEFAULT_SHIPROCKET_PASS;
    let token = '';
    let rawCsvOrders = null;
    let fetchArchive = false;

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }
      if (body) {
        if (body.email) email = body.email.trim();
        if (body.password) password = body.password.trim();
        if (body.token) token = body.token.trim();
        if (body.csvOrders) rawCsvOrders = body.csvOrders;
        if (body.fetchArchive) fetchArchive = true;
      }
    } else if (req.method === 'GET') {
      if (req.query?.archive === 'true') fetchArchive = true;
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
        const isRtoActive = (statusUpper.includes('UNDELIVERED-1ST') || statusUpper.includes('UNDELIVERED-2ND') || statusUpper.includes('RTO INITIATED')) && !statusUpper.includes('DELIVERED');
        const isDelivered = statusUpper.includes('DELIVERED') && !statusUpper.includes('RTO');
        const isCancelled = statusUpper.includes('CANCEL') || statusUpper.includes('3RD ATTEMPT') || statusUpper.includes('RTO DELIVERED');

        return {
          shopify_order_id: orderId,
          customer_name: customer,
          phone: validPhone,
          product,
          amount,
          status: isDelivered ? 'confirmed' : (isRtoActive ? 'rto_attempted' : (isCancelled ? 'rto_lost' : 'pending_confirmation')),
          urgent_rto: isRtoActive,
          call_type: isRtoActive ? 'RTO Rescue' : (isDelivered ? 'Old Customer Feedback' : 'Order Confirmation'),
          shiprocket_shipment_id: awb || orderId,
          created_at: createdAt,
          notes: `Status: ${status} | City: ${city} | Courier: ${courier} | AWB: ${awb || 'N/A'}`
        };
      });

      if (mappedOrders.length > 0) {
        await supabase.from('amparo_calls').upsert(mappedOrders, { onConflict: 'shopify_order_id' });
      }

      return res.status(200).json({
        success: true,
        count: mappedOrders.length,
        orders: mappedOrders
      });
    }

    // 2. Authenticate with Shiprocket REST API (Multi-Email Auto-Fallback)
    if (!token) {
      const emailCandidates = [email, 'atulmishra9506348351@gmail.com', 'amparohealthcare013@gmail.com', 'Mukulmishr8887521156@gmail.com'].filter(Boolean);
      let authSuccess = false;
      let lastErrorMessage = '';

      for (const candEmail of emailCandidates) {
        try {
          const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: candEmail, password })
          });

          const authData = await authRes.json();
          if (authRes.ok && authData && authData.token) {
            token = authData.token;
            authSuccess = true;
            break;
          } else {
            lastErrorMessage = authData.message || 'Authentication error';
          }
        } catch (e) {
          lastErrorMessage = e.message;
        }
      }

      if (!authSuccess || !token) {
        return res.status(401).json({
          success: false,
          message: `Shiprocket authentication failed: ${lastErrorMessage}. Kripya password check karein.`
        });
      }
    }

    // A. If user explicitly requests full 947+ Historical Archive
    if (fetchArchive) {
      let allShipments = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 12) {
        try {
          const sRes = await fetch(`https://apiv2.shiprocket.in/v1/external/shipments?per_page=100&page=${page}`, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
          });
          const sData = await sRes.json();
          const list = sData?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            allShipments = allShipments.concat(list);
            if (list.length < 100) hasMore = false;
            else page++;
          } else {
            hasMore = false;
          }
        } catch (e) {
          hasMore = false;
        }
      }

      const archiveData = allShipments.map((s, idx) => ({
        id: s.id,
        order_id: String(s.order_id || s.id),
        awb: s.awb || 'Pending',
        courier: s.courier_name || 'Assigned Courier',
        product: Array.isArray(s.products) && s.products[0] ? s.products[0].name : 'Amparo Product',
        status: s.status || 'Active',
        created_at: s.created_at || 'Historical',
        channel: s.channel_name || 'Shiprocket'
      }));

      return res.status(200).json({
        success: true,
        isArchive: true,
        count: archiveData.length,
        archive: archiveData
      });
    }

    // B. Default Live Active Orders Sync (Latest Live Orders from Shiprocket)
    const ordersRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders?per_page=100', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const ordersData = await ordersRes.json();
    const rawOrders = ordersData?.data || [];

    const activeLiveOrders = rawOrders.map((o) => {
      const statusStr = String(o.status || '').toUpperCase();
      
      const isRtoActive = (statusStr.includes('UNDELIVERED-1ST') || statusStr.includes('UNDELIVERED-2ND') || statusStr.includes('RTO INITIATED') || statusStr.includes('RTO IN TRANSIT')) && !statusStr.includes('3RD') && !statusStr.includes('RTO DELIVERED');
      const isDelivered = statusStr.includes('DELIVERED') && !statusStr.includes('RTO');
      const isCancelled = statusStr.includes('CANCEL') || statusStr.includes('3RD ATTEMPT') || statusStr.includes('RTO DELIVERED');

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
      const validPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : (rawPhone && !rawPhone.includes('xxx') ? rawPhone : '+91');
      const custName = o.customer_name || (o.others && o.others.billing_name) || 'Customer';
      const awb = o.shipments && o.shipments[0] ? String(o.shipments[0].awb) : '';
      const rawCourier = o.shipments && o.shipments[0] ? String(o.shipments[0].courier_name || 'Courier') : 'Courier';
      const cleanCourier = rawCourier.replace(/surface|express|air|b2b/gi, '').trim() || 'कूरियर पार्टनर';
      const rawEtd = o.shipments && o.shipments[0] ? (o.shipments[0].etd || o.shipments[0].edd || o.shipments[0].expected_delivery_date || '') : '';
      const city = o.customer_city || (o.others && o.others.billing_city) || 'India';

      let smartTimeline = 'तीन से पाँच दिन में';
      if (statusStr.includes('OUT FOR DELIVERY')) {
        smartTimeline = 'आज शाम तक (डिलीवरी बॉय एरिया में है)';
      } else if (statusStr.includes('DESTINATION HUB') || statusStr.includes('UNDELIVERED') || isRtoActive) {
        smartTimeline = 'आज या कल तक';
      } else if (rawEtd) {
        try {
          const d = new Date(rawEtd);
          if (!isNaN(d.getTime())) {
            const months = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
            smartTimeline = `${d.getDate()} ${months[d.getMonth()]} तक`;
          }
        } catch (e) {}
      } else if (statusStr.includes('IN TRANSIT') || statusStr.includes('SHIPPED')) {
        smartTimeline = 'दो से तीन दिन में';
      }

      return {
        shopify_order_id: String(o.channel_order_id || (o.others && o.others.name) || o.id),
        customer_name: custName === 'Not Authorized' ? 'Verified Buyer' : custName,
        phone: validPhone,
        product: items,
        amount: Number(o.total || (o.others && o.others.subtotal_price) || 588),
        status: isDelivered ? 'confirmed' : (isRtoActive ? 'rto_attempted' : (isCancelled ? 'rto_lost' : 'pending_confirmation')),
        urgent_rto: isRtoActive,
        call_type: isRtoActive ? 'RTO Rescue' : (isDelivered ? 'Old Customer Feedback' : 'Order Confirmation'),
        shiprocket_shipment_id: awb || String(o.id),
        courier_name: cleanCourier,
        expected_delivery_date: rawEtd || smartTimeline,
        delivery_timeline: `${cleanCourier} कूरियर से ${smartTimeline}`,
        created_at: o.created_at || new Date().toISOString(),
        notes: `Status: ${o.status || 'Active'} | City: ${city} | Courier: ${cleanCourier} | AWB: ${awb || 'Pending'} | EDD: ${smartTimeline}`
      };
    });

    if (activeLiveOrders.length > 0) {
      // Fetch existing orders from database to preserve real unmasked phone numbers & customer names
      const { data: existingDbOrders } = await supabase
        .from('amparo_calls')
        .select('shopify_order_id, phone, customer_name');

      const phoneMap = new Map();
      if (existingDbOrders) {
        existingDbOrders.forEach((item) => {
          if (item.phone && item.phone !== '+91' && !item.phone.includes('xxx')) {
            phoneMap.set(String(item.shopify_order_id), {
              phone: item.phone,
              customer_name: item.customer_name
            });
          }
        });
      }

      const finalMergedOrders = activeLiveOrders.map((o) => {
        const existing = phoneMap.get(String(o.shopify_order_id));
        return {
          ...o,
          phone: (o.phone && o.phone !== '+91' && !o.phone.includes('xxx')) ? o.phone : (existing?.phone || o.phone),
          customer_name: (o.customer_name && o.customer_name !== 'Not Authorized' && o.customer_name !== 'Verified Buyer') ? o.customer_name : (existing?.customer_name || o.customer_name)
        };
      });

      await supabase.from('amparo_calls').upsert(finalMergedOrders, { onConflict: 'shopify_order_id' });

      return res.status(200).json({
        success: true,
        count: finalMergedOrders.length,
        orders: finalMergedOrders
      });
    }

    return res.status(200).json({
      success: true,
      count: 0,
      orders: []
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
