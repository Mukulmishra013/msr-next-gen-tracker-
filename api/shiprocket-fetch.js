// Direct Shiprocket Live Orders & Live NDR (Non-Delivery Report) Engine
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
        const isDelivered = statusUpper.includes('DELIVERED') && !statusUpper.includes('RTO');
        const isCancelled = statusUpper.includes('CANCEL') || statusUpper.includes('RTO DELIVERED');
        const isNdrActive = (statusUpper.includes('UNDELIVERED') || statusUpper.includes('NDR') || statusUpper.includes('RTO IN TRANSIT') || statusUpper.includes('RTO INITIATED')) && !isDelivered && !isCancelled;

        return {
          shopify_order_id: orderId,
          customer_name: customer,
          phone: validPhone,
          product,
          amount,
          status: isDelivered ? 'confirmed' : (isNdrActive ? 'rto_attempted' : (isCancelled ? 'rto_lost' : 'pending_confirmation')),
          urgent_rto: isNdrActive,
          call_type: isNdrActive ? 'RTO Rescue' : (isDelivered ? 'Old Customer Feedback' : 'Order Confirmation'),
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
      const emailCandidates = [email, 'atulmishra9506348351@gmail.com', 'Mukulmishr8887521156@gmail.com'].filter(Boolean);
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
          message: `Shiprocket authentication failed: ${lastErrorMessage}. Kripya credentials check karein.`
        });
      }
    }

    // 3. Fetch Live NDR (Non-Delivery Reports) Orders & Live Active Orders Concurrently
    const [ordersRes, ndrRes] = await Promise.all([
      fetch('https://apiv2.shiprocket.in/v1/external/orders?per_page=100', {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      }),
      fetch('https://apiv2.shiprocket.in/v1/external/ndr/all', {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      })
    ]);

    const ordersData = await ordersRes.json();
    const ndrData = await ndrRes.json();

    const rawOrders = ordersData?.data || [];
    const rawNdr = ndrData?.data || (Array.isArray(ndrData) ? ndrData : []);

    // Create NDR Map keyed by channel_order_id or shipment_id
    const ndrMap = new Map();
    rawNdr.forEach((n) => {
      const k1 = String(n.channel_order_id || '').replace('#', '').trim();
      const k2 = String(n.id || '');
      const k3 = String(n.awb_code || '');
      if (k1) ndrMap.set(k1, n);
      if (k2) ndrMap.set(k2, n);
      if (k3) ndrMap.set(k3, n);
    });

    const activeLiveOrders = rawOrders.map((o) => {
      const orderCleanId = String(o.channel_order_id || (o.others && o.others.name) || o.id).replace('#', '').trim();
      const awbCode = o.shipments && o.shipments[0] ? String(o.shipments[0].awb) : '';
      
      const ndrMatch = ndrMap.get(orderCleanId) || (awbCode ? ndrMap.get(awbCode) : null);
      const statusStr = String(o.status || '').toUpperCase();

      // NDR Priority: If present in live NDR, it is 100% active RTO Rescue
      const isNdrActive = Boolean(ndrMatch) || (
        (statusStr.includes('UNDELIVERED') || statusStr.includes('NDR') || statusStr.includes('RTO IN TRANSIT') || statusStr.includes('RTO INITIATED') || statusStr.includes('1ST ATTEMPT') || statusStr.includes('2ND ATTEMPT')) &&
        !statusStr.includes('DELIVERED') &&
        !statusStr.includes('3RD ATTEMPT')
      );

      const isDelivered = statusStr.includes('DELIVERED') && !statusStr.includes('RTO');
      const isFinalReturnedToOffice = statusStr.includes('RTO DELIVERED') || statusStr.includes('3RD ATTEMPT') || statusStr.includes('CANCEL');

      const items = Array.isArray(o.products) && o.products.length > 0
        ? o.products.map((p) => p.name).join(', ')
        : (o.others && o.others.order_items && o.others.order_items[0] ? o.others.order_items[0].name : 'Amparo Pure Shilajit');

      const rawPhone = String(
        o.customer_phone ||
        o.customer_mobile ||
        (o.others && o.others.billing_phone) ||
        ''
      );

      const cleanDigits = rawPhone.replace(/\D/g, '');
      const validPhone = cleanDigits.length >= 10 ? `+91${cleanDigits.slice(-10)}` : (rawPhone && !rawPhone.includes('xxx') ? rawPhone : '+91');
      const custName = o.customer_name || (o.others && o.others.billing_name) || (ndrMatch ? ndrMatch.customer_name : 'Customer');
      const rawCourier = o.shipments && o.shipments[0] ? String(o.shipments[0].courier_name || 'Courier') : (ndrMatch ? ndrMatch.courier : 'Courier');
      const cleanCourier = rawCourier.replace(/surface|express|air|b2b/gi, '').trim() || 'Courier';
      const city = o.customer_city || (o.others && o.others.billing_city) || (ndrMatch ? ndrMatch.customer_city : 'India');
      const finalAwb = awbCode || (ndrMatch ? ndrMatch.awb_code : 'Pending');

      let attemptInfo = '';
      if (ndrMatch) {
        attemptInfo = `[NDR ${ndrMatch.attempts || 1}st Attempt: ${ndrMatch.reason || 'Consignee Unreachable'}]`;
      } else if (statusStr.includes('1ST')) {
        attemptInfo = `[1st Attempt Fail]`;
      } else if (statusStr.includes('2ND')) {
        attemptInfo = `[2nd Attempt Fail]`;
      } else if (statusStr.includes('3RD')) {
        attemptInfo = `[3rd Attempt Fail]`;
      }

      let finalStatus = 'pending_confirmation';
      let callType = 'Order Confirmation';

      if (isNdrActive) {
        finalStatus = 'rto_attempted';
        callType = 'RTO Rescue';
      } else if (isDelivered) {
        finalStatus = 'delivered';
        callType = 'Old Customer Feedback';
      } else if (isFinalReturnedToOffice) {
        finalStatus = 'rto_lost';
        callType = 'Order Cancelled';
      }

      return {
        shopify_order_id: String(o.channel_order_id || (o.others && o.others.name) || o.id),
        customer_name: custName === 'Not Authorized' ? 'Verified Buyer' : custName,
        phone: validPhone,
        product: items,
        amount: Number(o.total || (o.others && o.others.subtotal_price) || 449),
        status: finalStatus,
        urgent_rto: isNdrActive,
        call_type: callType,
        shiprocket_shipment_id: finalAwb,
        courier_name: cleanCourier,
        created_at: o.created_at || (ndrMatch ? ndrMatch.created_at : new Date().toISOString()),
        notes: `Status: ${ndrMatch ? 'Active NDR Action Required' : (o.status || 'Active')} ${attemptInfo} | City: ${city} | Courier: ${cleanCourier} | AWB: ${finalAwb}`
      };
    });

    if (activeLiveOrders.length > 0) {
      // Preserve existing real unmasked phone numbers & customer names from Supabase
      const { data: existingDbOrders } = await supabase
        .from('amparo_calls')
        .select('shopify_order_id, phone, customer_name');

      const phoneMap = new Map();
      if (existingDbOrders) {
        existingDbOrders.forEach((item) => {
          if (item.phone && item.phone !== '+91' && !item.phone.includes('xxx')) {
            phoneMap.set(String(item.shopify_order_id).replace('#', '').trim(), {
              phone: item.phone,
              customer_name: item.customer_name
            });
          }
        });
      }

      const finalMergedOrders = activeLiveOrders.map((o) => {
        const cleanK = String(o.shopify_order_id).replace('#', '').trim();
        const existing = phoneMap.get(cleanK);
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
        ndrCount: rawNdr.length,
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
