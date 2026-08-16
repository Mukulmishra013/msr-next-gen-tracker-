// Netlify/Vercel Serverless Function: Trigger Autonomous AI Voice Calls via Bolna.ai with RTO & Order Confirmation Routing
// Endpoint: https://msr-next-gen-tracker.vercel.app/api/bolna-call

export const config = { runtime: 'edge' };

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
      call_purpose, // 'RTO_RESCUE' | 'ORDER_CONFIRMATION' | 'OLD_CUSTOMER_FEEDBACK'
      is_rto,
      batch_orders
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

      const cleanName = (orderData.customer_name && orderData.customer_name !== 'Verified Buyer' && orderData.customer_name !== 'Customer') 
        ? String(orderData.customer_name).replace(/[\r\n\t]/g, '').trim() 
        : 'Customer';

      // Strict Priority-Based Call Purpose Determination
      let determinedPurpose = 'ORDER_CONFIRMATION';
      if (orderData.call_purpose === 'RTO_RESCUE' || orderData.urgent_rto || orderData.is_rto || orderData.call_type === 'RTO Rescue') {
        determinedPurpose = 'RTO_RESCUE';
      } else if (orderData.call_purpose === 'OLD_CUSTOMER_FEEDBACK' || orderData.customer_type === 'OLD_CUSTOMER' || orderData.call_type === 'Old Customer Feedback' || orderData.status === 'delivered') {
        determinedPurpose = 'OLD_CUSTOMER_FEEDBACK';
      } else if (orderData.call_purpose === 'ORDER_CONFIRMATION' || orderData.call_type === 'Order Confirmation') {
        determinedPurpose = 'ORDER_CONFIRMATION';
      }

      const isRtoOrder = determinedPurpose === 'RTO_RESCUE';

      // Clean amount: numbers only (e.g. '449')
      const cleanAmount = String(orderData.order_amount || orderData.amount || '449').replace(/\D/g, '') || '449';
      
      // Clean order ID: '1295'
      const cleanOrderId = String(orderData.shopify_order_id || orderData.order_id || '101').replace('#', '').trim();

      // Clean product: Extract short & natural conversational brand title (e.g. 'Smilika Sunscreen' or 'Amparo Shilajit')
      const rawProduct = String(orderData.product_name || orderData.product || 'Amparo Shilajit Gummies');
      let cleanProduct = rawProduct;
      const lowerProd = rawProduct.toLowerCase();
      if (lowerProd.includes('sunscreen') || lowerProd.includes('suncream') || lowerProd.includes('smilika')) {
        cleanProduct = 'Smilika Sunscreen';
      } else if (lowerProd.includes('shilajit') && lowerProd.includes('resin')) {
        cleanProduct = 'Amparo Shilajit Resin';
      } else if (lowerProd.includes('shilajit') || lowerProd.includes('gummies')) {
        cleanProduct = 'Amparo Shilajit Gummies';
      } else if (lowerProd.includes('energy') || lowerProd.includes('drink')) {
        cleanProduct = 'Amparo Energy Drink';
      } else {
        cleanProduct = rawProduct
          .split('–')[0]
          .split('-')[0]
          .split('(')[0]
          .replace(/\(x\d+\)/gi, '')
          .replace(/[\r\n\t]/g, '')
          .trim() || 'Amparo Product';
      }

      // Clean address / city
      let cleanAddress = String(orderData.delivery_address || orderData.city || orderData.notes || 'India');
      if (cleanAddress.includes('City:')) {
        cleanAddress = cleanAddress.split('City:')[1]?.split('|')[0]?.trim() || 'India';
      } else if (cleanAddress.includes('Status:')) {
        cleanAddress = cleanAddress.replace(/Status:.*?\|/gi, '').replace(/Courier:.*?\|/gi, '').replace(/AWB:.*?\|/gi, '').replace(/EDD:.*?$/gi, '').trim() || 'India';
      }
      const amountWithRupees = `${cleanAmount} रुपये`;

      const userData = {
        customer_name: cleanName,
        name: cleanName,
        customer_display_name: cleanName === 'Customer' ? 'सर' : cleanName,
        order_id: cleanOrderId,
        product_name: cleanProduct,
        product: cleanProduct,
        order_amount: cleanAmount,
        amount: cleanAmount,
        order_amount_words: amountWithRupees,
        delivery_address: cleanAddress,
        delivery_timeline: orderData.delivery_timeline || (orderData.courier_name ? `${orderData.courier_name} कूरियर से तीन से पाँच दिन में` : 'तीन से पाँच दिन में'),
        courier_name: orderData.courier_name || 'कूरियर पार्टनर',
        expected_delivery_date: orderData.expected_delivery_date || 'तीन से पाँच दिन में',
        combo_product: orderData.combo_product || 'Smilika SPF 50 Sunscreen',
        combo_discount: orderData.combo_discount || 'एक सौ रुपये की छूट',
        customer_type: determinedPurpose === 'OLD_CUSTOMER_FEEDBACK' ? 'OLD_CUSTOMER' : 'NEW_CUSTOMER',
        call_purpose: determinedPurpose,
        is_rto: isRtoOrder ? 'true' : 'false',
        discount_value: orderData.discount_value || 'पचास रुपये की विशेष छूट',
        coupon_code: orderData.coupon_code || 'AMPARO50'
      };

      const bolnaPayload = {
        agent_id: BOLNA_AGENT_ID,
        recipient_phone_number: recipientPhone,
        webhook_url: 'https://msr-next-gen-tracker.vercel.app/api/bolna-webhook',
        user_data: userData,
        recipient_data: userData
      };

      console.log('>>> [BOLNA API DISPATCH] Calling:', recipientPhone, 'Payload:', JSON.stringify(bolnaPayload, null, 2));

      const bolnaRes = await fetch('https://api.bolna.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BOLNA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bolnaPayload)
      });

      const bolnaResult = await bolnaRes.json();
      console.log('<<< [BOLNA API RESPONSE]:', JSON.stringify(bolnaResult, null, 2));

      if (!bolnaRes.ok) {
        throw new Error(bolnaResult.message || bolnaResult.detail || 'Bolna API calling error');
      }

      const executionId = bolnaResult.execution_id || bolnaResult.call_id || bolnaResult.id || null;

      // Meta payload stored safely in notes column
      const callMeta = {
        bolna_call_id: executionId,
        call_purpose: determinedPurpose,
        is_rto: isRtoOrder,
        call_source: 'ai_agent',
        status: 'calling_in_progress',
        initiated_at: new Date().toISOString(),
        customer_name: cleanName,
        phone: recipientPhone
      };

      const notesContent = `[AI_LOG]${JSON.stringify(callMeta)}[/AI_LOG]`;

      if (orderData.id || orderData.shopify_order_id) {
        if (orderData.id) {
          await supabase.from('amparo_calls').update({
            status: 'calling_in_progress',
            phone: recipientPhone,
            notes: notesContent
          }).eq('id', orderData.id);
        } else {
          await supabase.from('amparo_calls').update({
            status: 'calling_in_progress',
            phone: recipientPhone,
            notes: notesContent
          }).eq('shopify_order_id', orderData.shopify_order_id);
        }
      }

      return {
        phone: recipientPhone,
        execution_id: executionId,
        call_purpose: determinedPurpose,
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
      coupon_code,
      call_purpose,
      is_rto,
      call_type: body.call_type,
      urgent_rto: body.urgent_rto
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
