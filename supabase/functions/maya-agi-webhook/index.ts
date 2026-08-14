// Supabase Edge Function: Maya AGI External Central Gateway Webhook
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const payload = await req.json();
    const eventType = payload.eventType || "MAYA_AGI_EVENT";

    // Log event to agent memories
    await supabase.from("agent_memories").insert({
      agent_id: payload.agentId || "maya_core",
      type: eventType,
      content: payload.content || JSON.stringify(payload)
    });

    return new Response(JSON.stringify({ status: "ACKNOWLEDGED", timestamp: new Date().toISOString() }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400
    });
  }
});
