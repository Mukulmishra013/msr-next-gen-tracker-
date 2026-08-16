// Netlify Serverless Function: Real-Time Webhook Receiver for Bolna.ai Voice Calls
// Endpoint: https://msrnext.netlify.app/api/bolna-webhook

import { createClient } from '@supabase/supabase-js';
import { cancelShopifyOrder, addTagsToShopifyOrder } from './shopify-order-action.js';

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
    let rescheduleSlot = extractions.reschedule_slot || null;
    let comboAccepted = false;
    let aiDecision = 'confirmed';

    if (bolnaStatus === 'no-answer' || bolnaStatus === 'busy' || bolnaStatus === 'failed' || extractions.order_decision === 'no_answer') {
      finalStatus = 'pending_confirmation';
      actionRequired = 'manual_followup';
      aiDecision = 'no_answer';
    } else if (
      extractions.order_decision === 'cancelled' ||
      transcriptLower.includes('cancel') ||
      transcriptLower.includes('nahi chahiye') ||
      transcriptLower.includes('mat bhejo') ||
      transcriptLower.includes('wrong order')
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
      extractions.order_decision === 'rescheduled' ||
      transcriptLower.includes('reschedule') || 
      transcriptLower.includes('baad mein') || 
      transcriptLower.includes('kal aao') ||
      transcriptLower.includes('sham ko') ||
      transcriptLower.includes('shaam') ||
      rescheduleSlot
    ) {
      finalStatus = 'rescheduled';
      actionRequired = 'reschedule_dispatch';
      aiDecision = 'rescheduled';
      if (!rescheduleSlot) {
        if (transcriptLower.includes('sham') || transcriptLower.includes('shaam') || transcriptLower.includes('evening')) {
          rescheduleSlot = 'Today Evening';
        } else if (transcriptLower.includes('kal') || transcriptLower.includes('tomorrow')) {
          rescheduleSlot = 'Tomorrow';
        }
      }
    } else if (
      extractions.order_decision === 'confirmed' ||
      transcriptLower.includes('confirm') || 
      transcriptLower.includes('haan') || 
      transcriptLower.includes('bhej do') ||
      transcriptLower.includes('deliver')
    ) {
      finalStatus = userData.call_purpose === 'RTO_RESCUE' ? 'rto_saved' : 'confirmed';
      actionRequired = 'ship_immediately';
      aiDecision = 'confirmed';
    }

    if (transcriptLower.includes('combo add') || extractions.combo_accepted === true || extractions.combo_added === true) {
      comboAccepted = true;
    }

    // 3. Package into Safe JSON Metadata for Supabase notes column
    const callMetadata = {
      recording_url: recordingUrl,
      transcript: transcriptText,
      ai_summary: summary || `Maya AI Call: ${aiDecision.toUpperCase()}${rescheduleSlot ? ` (${rescheduleSlot})` : ''}`,
      ai_decision: aiDecision,
      reschedule_slot: rescheduleSlot,
      call_duration: durationSec,
      call_source: 'ai_agent',
      action_required: actionRequired,
      cancellation_reason: cancellationReason,
      combo_accepted: comboAccepted,
      completed_at: new Date().toISOString(),
      bolna_call_id: executionId
    };

    const notesPayload = `[AI_LOG]${JSON.stringify(callMetadata)}[/AI_LOG]`;

    const updateFields = {
      status: finalStatus,
      notes: notesPayload
    };

    // Update by orderId, executionId, or phone
    if (orderId) {
      const cleanId = String(orderId).replace('#', '').trim();
      const withHash = `#${cleanId}`;
      await supabase.from('amparo_calls').update(updateFields).or(`shopify_order_id.eq.${cleanId},shopify_order_id.eq.${withHash}`);

      // 4. Closed-Loop Shopify Automation
      try {
        if (finalStatus === 'rto_lost' || aiDecision === 'cancelled') {
          // AUTO-CANCEL ON SHOPIFY
          await cancelShopifyOrder({
            orderId: cleanId,
            reason: cancellationReason || 'customer',
            note: `Auto-cancelled by Maya AI voice call: ${cancellationReason || 'Customer declined delivery'}`
          });
        } else if (finalStatus === 'confirmed' || aiDecision === 'confirmed') {
          // AUTO-TAG AS VERIFIED ON SHOPIFY
          await addTagsToShopifyOrder({
            numericId: cleanId,
            newTags: ['maya_verified', 'ai_confirmed', comboAccepted ? 'maya_combo_upsold' : 'maya_confirmed'],
            note: `Verified by Maya AI at ${new Date().toISOString()}`
          });
        }
      } catch (shopifyErr) {
        console.error('Error during Shopify automated action:', shopifyErr);
      }
    }
    
    if (recipientPhone) {
      const cleanDigits = String(recipientPhone).replace(/\D/g, '').slice(-10);
      await supabase.from('amparo_calls').update(updateFields).ilike('phone', `%${cleanDigits}%`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Bolna call webhook processed successfully and saved permanently to Supabase',
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
