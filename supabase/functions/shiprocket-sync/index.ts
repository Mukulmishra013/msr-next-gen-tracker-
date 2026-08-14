// Supabase Edge Function: Shiprocket Webhook Receiver
// Documentation: https://apidocs.shiprocket.in/#webhooks
// Automatically syncs Shiprocket Tracking Status with Amparo Calls Queue

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    // 1. Validate Method
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // 2. Parse Shiprocket JSON Payload
    const payload = await req.json();
    
    // Extract key Shiprocket payload identifiers
    const awb = payload.awb ? String(payload.awb) : null;
    const orderId = payload.order_id ? String(payload.order_id) : null;
    const channelOrderId = payload.channel_order_id ? String(payload.channel_order_id) : null;
    const currentStatus = (payload.current_status || payload.shipment_status || "").trim();
    const statusUpper = currentStatus.toUpperCase();
    const courierName = payload.courier_name || "Shiprocket Courier";
    
    // Latest scan activity
    const latestScan = Array.isArray(payload.scans) && payload.scans.length > 0 ? payload.scans[0] : null;
    const scanNote = latestScan ? `[${latestScan.location || 'Hub'}]: ${latestScan.activity || currentStatus}` : currentStatus;

    // 3. Determine if shipment requires Urgent Telecaller Rescue
    const isUrgentRto =
      statusUpper.includes("RTO") ||
      statusUpper.includes("UNDELIVERED") ||
      statusUpper.includes("FAILED") ||
      statusUpper.includes("CHARGES PENDING") ||
      statusUpper.includes("CUSTOMER REFUSED");

    const isDelivered = statusUpper.includes("DELIVERED") && !statusUpper.includes("RTO DELIVERED");

    // Build update object
    const updateFields: Record<string, any> = {
      notes: `Shiprocket (${courierName} AWB: ${awb || 'N/A'}): ${scanNote}`
    };

    if (awb) {
      updateFields.shiprocket_shipment_id = awb;
    }

    if (isUrgentRto) {
      updateFields.urgent_rto = true;
      updateFields.call_type = "RTO Rescue";
    } else if (isDelivered) {
      updateFields.urgent_rto = false;
      updateFields.status = "confirmed";
      updateFields.call_type = "Delivery Feedback";
    }

    // 4. Update the matching record in Supabase amparo_calls table
    // Matches by Shopify Order ID (#1234), Shiprocket Order ID, or AWB
    let query = supabase.from("amparo_calls").update(updateFields);

    const conditions: string[] = [];
    if (channelOrderId) conditions.push(`shopify_order_id.eq.${channelOrderId}`);
    if (channelOrderId && !channelOrderId.startsWith("#")) conditions.push(`shopify_order_id.eq.#${channelOrderId}`);
    if (orderId) conditions.push(`shopify_order_id.eq.${orderId}`);
    if (awb) conditions.push(`shiprocket_shipment_id.eq.${awb}`);

    if (conditions.length > 0) {
      const { data, error } = await query.or(conditions.join(","));
      if (error) {
        console.error("Supabase update error:", error);
      }
    }

    // 5. Return success to Shiprocket Webhook tester
    return new Response(
      JSON.stringify({
        success: true,
        message: "Shiprocket tracking status received and processed by MSR Next Gen.",
        parsed: {
          awb,
          currentStatus,
          isUrgentRto,
          isDelivered
        }
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400
    });
  }
});
