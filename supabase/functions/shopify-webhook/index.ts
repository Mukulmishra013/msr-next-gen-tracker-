// Supabase Edge Function: Shopify Order Webhook Receiver
// Automatically ingests new Amparo store orders into amparo_calls
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const orderData = await req.json();
    const customer = orderData.customer || {};
    const lineItems = orderData.line_items || [];
    const productName = lineItems.map((item: any) => `${item.title} (x${item.quantity})`).join(", ") || "Amparo Product";

    const newCallRecord = {
      shopify_order_id: `#${orderData.order_number || orderData.id}`,
      customer_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Amparo Customer",
      phone: customer.phone || orderData.shipping_address?.phone || "+919876543210",
      product: productName,
      amount: parseFloat(orderData.total_price || "0"),
      order_date: orderData.created_at || new Date().toISOString(),
      call_type: "Order Confirmation",
      status: "pending_confirmation",
      urgent_rto: false,
      notes: `Shopify Auto-Sync: ${orderData.financial_status || "prepaid"}`
    };

    const { data, error } = await supabase.from("amparo_calls").insert(newCallRecord);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400
    });
  }
});
