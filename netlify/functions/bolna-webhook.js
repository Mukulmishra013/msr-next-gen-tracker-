// Netlify Serverless Function: Real-Time Webhook Receiver for Bolna.ai Voice Calls
// Endpoint: https://msrnext.netlify.app/api/bolna-webhook

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async (req) => {
  // 1. Handle CORS Preflight
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

  // Healthcheck on GET
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'active', service: 'Bolna Webhook Receiver' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const payload = await req.json();

    if (!payload) {
      return new Response(JSON.stringify({ error: 'No payload received' }), { status: 400 });
    }

    const executionId = payload.execution_id || payload.id || payload.call_id || null;
    const bolnaStatus = (payload.status || payload.call_status || '').toLowerCase();
    const durationSec = Math.round(Number(payload.conversation_duration || payload.duration || payload.duration_seconds || 0));
    
    // Recording URL Extraction
    const recordingUrl = 
      payload.recording_url || 
      payload.telephony_data?.recording_url || 
      payload.recording || 
      (executionId ? `https://api.bolna.ai/recordings/call/${executionId}` : null);

    // Transcript Extraction
    let transcriptText = '';
    if (typeof payload.transcript === 'string') {
      transcriptText = payload.transcript;
    } else if (Array.isArray(payload.transcript)) {
      transcriptText = payload.transcript.map(t => `${t.speaker || t.role}: ${t.text || t.message}`).join('\n');
    } else if (Array.isArray(payload.conversation_transcript)) {
      transcriptText = payload.conversation_transcript.map(t => `${t.role || t.speaker}: ${t.content || t.message || t.text}`).join('\n');
    }

    const summary = payload.summary || payload.call_summary || '';
    const extractions = payload.extracted_data || payload.extractions || {};

    const userData = payload.user_data || payload.context_details || {};
    const orderId = userData.order_id || payload.order_id || null;
    const recipientPhone = payload.recipient_phone_number || payload.phone || userData.phone || null;

    // 2. Intelligent Decision & Status Mapping
    const transcriptLower = (transcriptText + ' ' + summary + ' ' + JSON.stringify(extractions)).toLowerCase();
    let finalStatus = 'confirmed';
    let actionRequired = 'ship_immediately';
    let cancellationReason = null;
    let comboAccepted = false;
    let aiDecision = 'confirmed';

    if (bolnaStatus === 'no-answer' || bolnaStatus === 'busy' || bolnaStatus === 'failed') {
      finalStatus = 'pending_confirmation';
      actionRequired = 'manual_followup';
      aiDecision = 'no_answer';
    } else if (
      transcriptLower.includes('cancel') ||
      transcriptLower.includes('nahi chahiye') ||
      transcriptLower.includes('mat bhejo') ||
      transcriptLower.includes('wrong order') ||
      extractions.order_decision === 'cancelled'
    ) {
      finalStatus = 'rto_lost';
      actionRequired = 'cancel_in_shopify';
      aiDecision = 'cancelled';
      if (transcriptLower.includes('price') || transcriptLower.includes('mehnga')) {
        cancellationReason = 'Price too high';
      } else if (transcriptLower.includes('maine order nahi kiya') || transcriptLower.includes('wrong number')) {
        cancellationReason = 'Fake order / Not recognized';
        aiDecision = 'fake_order';
      } else {
        cancellationReason = extractions.cancellation_reason || 'Customer declined delivery';
      }
    } else if (
      transcriptLower.includes('reschedule') || 
      transcriptLower.includes('baad mein') || 
      transcriptLower.includes('kal call')
    ) {
      finalStatus = 'rescheduled';
      actionRequired = 'reschedule_dispatch';
      aiDecision = 'rescheduled';
    } else if (
      transcriptLower.includes('confirm') || 
      transcriptLower.includes('haan') || 
      transcriptLower.includes('bhej do') ||
      transcriptLower.includes('deliver')
    ) {
      finalStatus = userData.customer_type === 'OLD_CUSTOMER' ? 'rto_saved' : 'confirmed';
      actionRequired = 'ship_immediately';
      aiDecision = 'confirmed';
    }

    if (transcriptLower.includes('combo add') || extractions.combo_accepted === true || extractions.combo_added === true) {
      comboAccepted = true;
    }

    // 3. Update Supabase amparo_calls Record
    const updateFields = {
      status: finalStatus,
      call_source: 'ai_agent',
      bolna_call_id: executionId,
      call_duration_seconds: durationSec,
      recording_url: recordingUrl,
      transcript: transcriptText,
      ai_summary: summary || `AI Call finished (${finalStatus}). Decision: ${aiDecision}`,
      ai_decision: aiDecision,
      cancellation_reason: cancellationReason,
      combo_accepted: comboAccepted,
      action_required: actionRequired,
      notes: `🤖 Maya AI: ${aiDecision.toUpperCase()} | Duration: ${durationSec}s | Action: ${actionRequired}`
    };

    let updateQuery;
    if (orderId) {
      updateQuery = supabase.from('amparo_calls').update(updateFields).eq('shopify_order_id', orderId);
    } else if (executionId) {
      updateQuery = supabase.from('amparo_calls').update(updateFields).eq('bolna_call_id', executionId);
    } else if (recipientPhone) {
      const cleanPhone = String(recipientPhone).replace(/\D/g, '').slice(-10);
      updateQuery = supabase.from('amparo_calls').update(updateFields).ilike('phone', `%${cleanPhone}%`);
    }

    if (updateQuery) {
      const { data, error } = await updateQuery;
      if (error) {
        console.error('Supabase update error:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Bolna call webhook processed successfully',
      decision: aiDecision,
      action_required: actionRequired,
      recording_url: recordingUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Webhook processing failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
