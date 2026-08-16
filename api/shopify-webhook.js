// Real-Time Shopify Webhook Receiver with AI Anti-Fraud Shield & Instant Maya AI Calling Dispatch
// Endpoint: https://msr-next-gen-tracker.vercel.app/api/shopify-webhook

import { createClient } from '@supabase/supabase-js';
import { cancelShopifyOrder } from './lib/shopify-order-action.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';
const BOLNA_API_KEY = process.env.BOLNA_API_KEY || process.env.VITE_BOLNA_API_KEY || 'bn-058fb2a67eb74db49a65c1a7fecf8956';
const BOLNA_AGENT_ID = process.env.BOLNA_AGENT_ID || process.env.VITE_BOLNA_AGENT_ID || '111395c5-8b11-462a-bd47-cf51dca0f296';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🛡️ Intelligent Anti-Fake Mobile & Fraud Hygiene Validator
function validateIndianPhoneNumber(rawPhone) {
  if (!rawPhone) return { isValid: false, reason: 'Empty Phone Number' };
  const digits = String(rawPhone).replace(/\D/g, '').slice(-10);

  if (digits.length !== 10) {
    return { isValid: false, reason: `Incomplete Phone Number (${digits.length} digits instead of 10)` };
  }

  if (!['6', '7', '8', '9'].includes(digits[0])) {
    return { isValid: false, reason: 'Invalid Indian Mobile Prefix (must start with 6, 7, 8, or 9)' };
  }

  const fakePatterns = [
    '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
    '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
    '1234567890', '0987654321', '9876543210', '9898989898', '9988776655'
  ];
  if (fakePatterns.includes(digits)) {
    return { isValid: false, reason: 'Spam/Test Dummy Number Pattern' };
  }

  if (/(\d)\1{6,}/.test(digits)) {
    return { isValid: false, reason: 'Spam Number (repeated digits)' };
  }

  return { isValid: true, validPhone: `+91${digits}` };
}

// Helper to trigger autonomous Bolna AI call immediately
async function triggerInstantAiCall({ orderId, phone, customerName, product, amount, city, adminGraphqlApiId, numericId }) {
  try {
    let cleanProduct = product || 'Amparo Pure Shilajit';
    const lowerProd = cleanProduct.toLowerCase();
    if (lowerProd.includes('sunscreen') || lowerProd.includes('suncream') || lowerProd.includes('smilika')) {
      cleanProduct = 'Smilika Sunscreen';
    } else if (lowerProd.includes('shilajit') && lowerProd.includes('resin')) {
      cleanProduct = 'Amparo Shilajit Resin';
    } else if (lowerProd.includes('shilajit') || lowerProd.includes('gummies')) {
      cleanProduct = 'Amparo Shilajit Gummies';
    }

    const payload = {
      agent_id: BOLNA_AGENT_ID,
      recipient_phone_number: phone,
      webhook_url: 'https://msr-next-gen-tracker.vercel.app/api/bolna-webhook',
      user_data: {
        customer_name: customerName || 'Customer',
        product_name: cleanProduct,
        order_amount: String(amount || 449).replace(/\D/g, '') || '449',
        order_id: String(orderId).replace('#', '').trim(),
        admin_graphql_api_id: adminGraphqlApiId || (numericId ? `gid://shopify/Order/${numericId}` : ''),
        numeric_id: String(numericId || ''),
        delivery_address: city || 'India',
        delivery_timeline: '3 se 4 working days',
        call_purpose: 'ORDER_CONFIRMATION',
        combo_product: 'Amparo Pure Shilajit Resin',
        combo_discount: '₹150'
      }
    };

    const response = await fetch('https://api.bolna.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOLNA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (err) {
    console.error('Bolna auto-call trigger error:', err);
    return { success: false, error: err.message };
  }
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Shopify Webhook Ready' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    if (!body || !body.id) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const orderId = String(body.name || `#${body.order_number}` || body.id);
    const numericShopifyId = String(body.id);
    const shipping = body.shipping_address || {};
    const billing = body.billing_address || {};
    const cust = body.customer || {};

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
      body.phone ||
      ''
    );

    const phoneValidation = validateIndianPhoneNumber(rawPhone);

    const items = Array.isArray(body.line_items) && body.line_items.length > 0
      ? body.line_items.map((i) => `${i.title} (x${i.quantity})`).join(', ')
      : 'Amparo Pure Shilajit (30g)';

    const city = shipping.city || billing.city || 'India';
    const amount = Number(body.total_price || 588);
    const isCancelled = !!body.cancelled_at;
    const isDelivered = body.fulfillment_status === 'fulfilled';

    // Fake number detected
    if (!phoneValidation.isValid) {
      const fakeOrderRecord = {
        shopify_order_id: orderId,
        customer_name: fullName,
        phone: rawPhone || 'INVALID_NUMBER',
        product: items,
        amount: amount,
        status: 'rto_lost',
        urgent_rto: true,
        call_type: 'Fake Order Blocked',
        shiprocket_shipment_id: numericShopifyId,
        notes: `[ANTI_FRAUD_SHIELD] 🛑 Fake/Invalid Mobile Number: ${phoneValidation.reason} | Auto-Cancelled on Shopify`
      };

      await supabase
        .from('amparo_calls')
        .upsert([fakeOrderRecord], { onConflict: 'shopify_order_id' });

      await cancelShopifyOrder({
        orderId: numericShopifyId || orderId,
        reason: 'customer',
        note: `Auto-cancelled by Maya AI Anti-Fraud Shield: ${phoneValidation.reason}`
      });

      return res.status(200).json({
        success: true,
        action: 'FAKE_ORDER_AUTO_CANCELLED',
        message: `Fake order detected (${phoneValidation.reason}). Auto-cancelled on Shopify without dialing.`,
        order: fakeOrderRecord
      });
    }

    // Valid number
    const validPhone = phoneValidation.validPhone;

    const newCall = {
      shopify_order_id: orderId,
      customer_name: fullName,
      phone: validPhone,
      product: items,
      amount: amount,
      status: isCancelled ? 'rto_lost' : (isDelivered ? 'confirmed' : 'pending_confirmation'),
      urgent_rto: isCancelled,
      call_type: isCancelled ? 'RTO Rescue' : (isDelivered ? 'Delivery Feedback' : 'Order Confirmation'),
      shiprocket_shipment_id: numericShopifyId,
      notes: `Shopify Real Order | Financial: ${body.financial_status || 'COD'} | City: ${city} | ShopifyId: ${numericShopifyId}`
    };

    await supabase
      .from('amparo_calls')
      .upsert([newCall], { onConflict: 'shopify_order_id' });

    let autoCallResult = null;
    if (!isCancelled && !isDelivered) {
      autoCallResult = await triggerInstantAiCall({
        orderId,
        phone: validPhone,
        customerName: fullName,
        product: items,
        amount,
        city,
        adminGraphqlApiId: body.admin_graphql_api_id || (numericShopifyId ? `gid://shopify/Order/${numericShopifyId}` : ''),
        numericId: numericShopifyId
      });

      const callLogNote = `[AUTO_AI_TRIGGER] Maya AI Dialed for Order Verification at ${new Date().toISOString()} | BolnaStatus: ${autoCallResult.success ? 'DIALED' : 'FAILED'}`;
      await supabase
        .from('amparo_calls')
        .update({
          notes: `${newCall.notes} | ${callLogNote}`
        })
        .eq('shopify_order_id', orderId);
    }

    return res.status(200).json({
      success: true,
      action: 'ORDER_VERIFICATION_DIALED',
      message: 'Valid order ingested and Maya AI auto-call dispatched successfully',
      order: newCall,
      autoCall: autoCallResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
