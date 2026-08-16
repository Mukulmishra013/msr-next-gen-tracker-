// Shopify Order Actions: Dynamic Client ID + Client Secret OAuth Authentication, Auto-Cancel & Auto-Tagging
// Endpoint: https://msr-next-gen-tracker.vercel.app/api/shopify-order-action

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || process.env.VITE_SHOPIFY_STORE || 'amparo.myshopify.com';
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || process.env.VITE_SHOPIFY_CLIENT_ID || 'a817dbe991c7e8c140bb85b122798617';
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || process.env.VITE_SHOPIFY_CLIENT_SECRET || '';

let cachedShopifyToken = null;
let tokenExpiresAt = 0;

export async function getShopifyAccessToken(store = SHOPIFY_STORE, clientId = SHOPIFY_CLIENT_ID, clientSecret = SHOPIFY_CLIENT_SECRET) {
  const now = Date.now();
  if (cachedShopifyToken && tokenExpiresAt > now) {
    return cachedShopifyToken;
  }

  if (clientSecret && (clientSecret.startsWith('shpat_') || clientSecret.startsWith('shpca_'))) {
    cachedShopifyToken = clientSecret;
    return clientSecret;
  }

  if (!clientSecret) {
    console.log('[Shopify Auth] No client secret configured yet in environment.');
    return '';
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(`https://${store}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const data = await res.json();
    if (res.ok && data.access_token) {
      cachedShopifyToken = data.access_token;
      tokenExpiresAt = now + ((data.expires_in || 86400) - 300) * 1000;
      return cachedShopifyToken;
    }
  } catch (e) {
    console.error('Shopify dynamic token exchange error:', e);
  }

  return clientSecret;
}

export async function cancelShopifyOrder({ orderId, reason = 'customer', note = 'Cancelled automatically by Maya AI' }) {
  try {
    let numericId = orderId;
    const cleanId = String(orderId).replace('#', '').trim();
    const token = await getShopifyAccessToken();

    // Search order to get numeric ID if needed
    if (isNaN(Number(numericId))) {
      const searchRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json?name=${encodeURIComponent(cleanId)}&status=any`, {
        headers: {
          'X-Shopify-Access-Token': token,
          'Content-Type': 'application/json'
        }
      });
      const searchData = await searchRes.json();
      if (searchData.orders && searchData.orders.length > 0) {
        numericId = searchData.orders[0].id;
      }
    }

    if (!numericId) {
      console.log(`[Shopify Mock] Simulated Auto-Cancellation of order #${cleanId}`);
      return { success: true, simulated: true, message: `Simulated cancellation of order #${cleanId}` };
    }

    const cancelRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/orders/${numericId}/cancel.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: reason,
        email: true,
        restock: true
      })
    });

    const cancelData = await cancelRes.json();

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
    const token = await getShopifyAccessToken();
    if (!token || !numericId) return { success: false };

    const getRes = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/orders/${numericId}.json?fields=id,tags,note`, {
      headers: { 'X-Shopify-Access-Token': token }
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
        'X-Shopify-Access-Token': token,
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ message: 'Shopify Order Action Handler Ready' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const { action, order_id, reason, note, tags } = body || {};

    if (action === 'cancel_order') {
      const result = await cancelShopifyOrder({ orderId: order_id, reason, note });
      return res.status(200).json(result);
    }

    if (action === 'tag_order') {
      const result = await addTagsToShopifyOrder({ numericId: order_id, newTags: tags || ['maya_verified'], note });
      return res.status(200).json(result);
    }

    return res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
