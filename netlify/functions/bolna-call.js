// Netlify Serverless Function: Trigger Autonomous AI Voice Calls via Bolna.ai
// Endpoint: https://msrnext.netlify.app/api/bolna-call

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';
const BOLNA_API_KEY = process.env.BOLNA_API_KEY || process.env.VITE_BOLNA_API_KEY || 'bn-058fb2a67eb74db49a65c1a7fecf8956';
const BOLNA_AGENT_ID = process.env.BOLNA_AGENT_ID || process.env.VITE_BOLNA_AGENT_ID || '111395c5-8b11-462a-bd47-cf51dca0f296';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async (req) => {
  // 1. CORS Preflight
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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const body = await req.json();
    const { 
      order_id, 
      phone, 
      customer_name, 
      product_name, 
      order_amount, 
      delivery_address, 
      delivery_timeline,
      combo_product,
      combo_discount,
      customer_type,
      discount_value,
      coupon_code,
      batch_orders // Optional array of orders for batch calling
    } = body;

    // Helper to format phone number to E.164 (+91XXXXXXXXXX)
    const formatPhone = (rawPhone) => {
      if (!rawPhone) return '';
      const digits = String(rawPhone).replace(/\D/g, '');
      if (digits.length === 10) return `+91${digits}`;
      if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
      if (rawPhone.startsWith('+')) return rawPhone;
      return `+91${digits.slice(-10)}`;
    };

    // Single Call Execution Helper
    const makeSingleCall = async (orderData) => {
      const recipientPhone = formatPhone(orderData.phone);
      if (!recipientPhone || recipientPhone.length < 12) {
        throw new Error(`Invalid phone number: ${orderData.phone}`);
      }

      // Map prompt variables for Maya
      const userData = {
        customer_name: orderData.customer_name || 'Customer',
        order_id: String(orderData.shopify_order_id || orderData.order_id || 'AMPARO-ORDER'),
        product_name: orderData.product_name || orderData.product || 'Amparo Pure Shilajit Gummies',
        order_amount: String(orderData.order_amount || orderData.amount || '449'),
        delivery_address: orderData.delivery_address || orderData.city || 'India',
        delivery_timeline: orderData.delivery_timeline || 'तीन से पाँच दिन',
        combo_product: orderData.combo_product || 'Smilika SPF 50 Sunscreen',
        combo_discount: orderData.combo_discount || 'एक सौ रुपये',
        customer_type: orderData.customer_type || 'NEW_CUSTOMER',
        discount_value: orderData.discount_value || 'पचास रुपये की छूट',
        coupon_code: orderData.coupon_code || 'AMPARO50'
      };

      const bolnaPayload = {
        agent_id: BOLNA_AGENT_ID,
        recipient_phone_number: recipientPhone,
        user_data: userData
      };

      const bolnaRes = await fetch('https://api.bolna.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BOLNA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bolnaPayload)
      });

      const bolnaResult = await bolnaRes.json();

      if (!bolnaRes.ok) {
        throw new Error(bolnaResult.message || bolnaResult.detail || 'Bolna API calling error');
      }

      const executionId = bolnaResult.execution_id || bolnaResult.call_id || bolnaResult.id || null;

      // Update Supabase amparo_calls record
      if (orderData.id || orderData.shopify_order_id) {
        const query = orderData.id 
          ? supabase.from('amparo_calls').update({
              status: 'calling_in_progress',
              call_source: 'ai_agent',
              bolna_call_id: executionId,
              notes: `🤖 Maya AI Call Initiated (ID: ${executionId || 'pending'}) at ${new Date().toLocaleTimeString('en-IN')}`
            }).eq('id', orderData.id)
          : supabase.from('amparo_calls').update({
              status: 'calling_in_progress',
              call_source: 'ai_agent',
              bolna_call_id: executionId,
              notes: `🤖 Maya AI Call Initiated (ID: ${executionId || 'pending'}) at ${new Date().toLocaleTimeString('en-IN')}`
            }).eq('shopify_order_id', orderData.shopify_order_id);

        await query;
      }

      return {
        phone: recipientPhone,
        execution_id: executionId,
        status: 'calling_in_progress',
        details: bolnaResult
      };
    };

    // 2. Batch Calling Execution
    if (Array.isArray(batch_orders) && batch_orders.length > 0) {
      const results = [];
      const errors = [];

      for (const ord of batch_orders) {
        try {
          const res = await makeSingleCall(ord);
          results.push(res);
        } catch (e) {
          errors.push({ order: ord.shopify_order_id || ord.id, error: e.message });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        type: 'batch',
        total_triggered: results.length,
        total_failed: errors.length,
        results,
        errors
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. Single Call Execution
    const singleResult = await makeSingleCall({
      id: body.id,
      shopify_order_id: order_id,
      phone,
      customer_name,
      product_name,
      order_amount,
      delivery_address,
      delivery_timeline,
      combo_product,
      combo_discount,
      customer_type,
      discount_value,
      coupon_code
    });

    return new Response(JSON.stringify({
      success: true,
      type: 'single',
      data: singleResult,
      message: `Maya AI call successfully placed to ${singleResult.phone}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Internal Server Error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
