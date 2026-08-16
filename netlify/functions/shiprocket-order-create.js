// Shiprocket Adhoc Order Creation Service: Auto-Create Fulfillment Order on Maya AI Confirmation
// Endpoint: https://msrnext.netlify.app/api/shiprocket-order-create

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL || process.env.VITE_SHIPROCKET_EMAIL || 'amparohealthcare013@gmail.com';
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD || process.env.VITE_SHIPROCKET_PASSWORD || '^zCGyq0I%uoef9Syy98qdZm*Z4h4ntQC';

let cachedToken = null;
let tokenExpiry = 0;

export async function getShiprocketToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now) {
    return cachedToken;
  }

  try {
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD
      })
    });

    const data = await authRes.json();
    if (authRes.ok && data.token) {
      cachedToken = data.token;
      tokenExpiry = now + 9 * 24 * 60 * 60 * 1000; // 9 days cache
      return cachedToken;
    }
  } catch (err) {
    console.error('Shiprocket token fetch error:', err);
  }
  return null;
}

export async function createShiprocketOrder({
  orderId,
  customerName = 'Customer',
  phone,
  address = 'India',
  city = 'India',
  pincode = '273001',
  state = 'Uttar Pradesh',
  productName = 'Amparo Pure Shilajit (30g)',
  amount = 449,
  paymentMethod = 'COD'
}) {
  try {
    const token = await getShiprocketToken();
    if (!token) {
      console.log(`[Shiprocket Mock] Simulated fulfillment creation for order #${orderId}`);
      return { success: true, simulated: true, message: `Simulated Shiprocket order creation for #${orderId}` };
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    const cleanOrderId = String(orderId).replace('#', '').trim();
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      order_id: cleanOrderId,
      order_date: nowStr,
      pickup_location: 'Primary',
      channel_id: '',
      comment: 'Verified and Dispatched by Maya AI',
      billing_customer_name: customerName,
      billing_last_name: '',
      billing_address: address,
      billing_address_2: '',
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: 'India',
      billing_email: 'customer@amparo.in',
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      order_items: [
        {
          name: productName,
          sku: 'AMPARO-SHILAJIT-01',
          units: 1,
          selling_price: Number(amount) || 449,
          discount: '',
          tax: '',
          hsn: 3004
        }
      ],
      payment_method: paymentMethod,
      sub_total: Number(amount) || 449,
      length: 10,
      breadth: 10,
      height: 5,
      weight: 0.2
    };

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    return {
      success: res.ok,
      data,
      shipment_id: data.shipment_id || data.order_id,
      message: res.ok ? `Order #${cleanOrderId} successfully pushed to Shiprocket!` : (data.message || 'Shiprocket Create Error')
    };
  } catch (err) {
    console.error('Error creating Shiprocket order:', err);
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
    return new Response(JSON.stringify({ message: 'Shiprocket Order Create Handler Ready' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const res = await createShiprocketOrder(body);
    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
