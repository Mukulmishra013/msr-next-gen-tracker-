// Shopify Order Actions: Auto-Cancel Refused Orders, Auto-Tag Verified Orders, and Status Reconciliation
// Endpoint: https://msrnext.netlify.app/api/shopify-order-action

const SHOPIFY_STORE = process.env.VITE_SHOPIFY_STORE || process.env.SHOPIFY_STORE || 'amparo-store-3405.myshopify.com';
const SHOPIFY_TOKEN = process.env.VITE_SHOPIFY_TOKEN || process.env.SHOPIFY_ACCESS_TOKEN || '';

export async function cancelShopifyOrder({ orderId, reason = 'customer', note = 'Cancelled automatically by Maya AI' }) {
  try {
    // If numeric orderId not provided, search by order name
    let numericId = orderId;
    const cleanId = String(orderId).replace('#', '').trim();

    if (!SHOPIFY_TOKEN) {
      console.log(`[Shopify Mock] Simulated Auto-Cancellation of order #${cleanId} on Shopify store.`);
      return { success: true, simulated: true, message: `Simulated cancellation of order #${cleanId} on Shopify.` };
    }

    // Search order to get numeric ID if needed
    if (isNaN(Number(numericId))) {
      const searchRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json?name=${encodeURIComponent(cleanId)}&status=any`, {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      const searchData = await searchRes.json();
      if (searchData.orders && searchData.orders.length > 0) {
        numericId = searchData.orders[0].id;
      }
    }

    if (!numericId) {
      return { success: false, message: `Could not resolve Shopify order numeric ID for #${cleanId}` };
    }

    // Call Shopify Cancel Order REST API
    const cancelRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/orders/${numericId}/cancel.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: reason,
        email: true,
        restock: true
      })
    });

    const cancelData = await cancelRes.json();

    // Add tags to Shopify order
    await addTagsToShopifyOrder({
      numericId,
      newTags: ['maya_ai_cancelled', 'rto_prevented', `cancel_reason_${reason.replace(/\s+/g, '_')}`],
      note
    });

    return {
      success: cancelRes.ok,
      data: cancelData,
      message: cancelRes.ok ? `Order #${cleanId} successfully cancelled on Shopify Store!` : 'Shopify Cancel Error'
    };
  } catch (err) {
    console.error('Error cancelling Shopify order:', err);
    return { success: false, error: err.message };
  }
}

export async function addTagsToShopifyOrder({ numericId, newTags = [], note = '' }) {
  try {
    if (!SHOPIFY_TOKEN || !numericId) return { success: false };

    // Fetch existing tags
    const getRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/orders/${numericId}.json?fields=id,tags,note`, {
      headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN }
    });
    const getData = await getRes.json();
    const existingTags = getData.order?.tags ? getData.order.tags.split(',').map((t) => t.trim()) : [];
    const mergedTags = Array.from(new Set([...existingTags, ...newTags])).join(', ');

    const updateBody = {
      order: {
        id: numericId,
        tags: mergedTags
      }
    };
    if (note) {
      updateBody.order.note = `${getData.order?.note ? `${getData.order.note} | ` : ''}${note}`;
    }

    const updateRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/orders/${numericId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateBody)
    });

    return { success: updateRes.ok };
  } catch (err) {
    console.error('Error tagging Shopify order:', err);
    return { success: false, error: err.message };
  }
}

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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Shopify Order Action Handler Ready' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { action, order_id, reason, note, tags } = body;

    if (action === 'cancel_order') {
      const res = await cancelShopifyOrder({ orderId: order_id, reason, note });
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (action === 'tag_order') {
      const res = await addTagsToShopifyOrder({ numericId: order_id, newTags: tags || ['maya_verified'], note });
      return new Response(JSON.stringify(res), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
