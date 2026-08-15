// Netlify Serverless Function: Check Bolna.ai Call Execution Status & Fetch Recording / Transcript
// Endpoint: https://msrnext.netlify.app/api/bolna-status

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';
const BOLNA_API_KEY = process.env.BOLNA_API_KEY || process.env.VITE_BOLNA_API_KEY || 'bn-058fb2a67eb74db49a65c1a7fecf8956';

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
    const url = new URL(req.url);
    const executionId = url.searchParams.get('execution_id') || url.searchParams.get('id');

    if (!executionId) {
      return new Response(JSON.stringify({ error: 'execution_id query param required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bolnaRes = await fetch(`https://api.bolna.ai/executions/${executionId}`, {
      headers: {
        'Authorization': `Bearer ${BOLNA_API_KEY}`
      }
    });

    if (!bolnaRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch execution from Bolna' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await bolnaRes.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
