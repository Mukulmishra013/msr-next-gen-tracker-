async function test() {
  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'atulmishra9506348351@gmail.com',
        password: 'k87oHWzmv6^9u8yxZsur8sw@G$DI0Od0'
      })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', JSON.stringify(data, null, 2));

    if (data.token) {
      console.log('AUTH SUCCESS! Fetching orders...');
      const ordRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders?per_page=10', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const ordData = await ordRes.json();
      console.log('ALL KEYS OF ORDER[0]:', Object.keys(ordData.data[0]));
      console.log('ORDER[0] PHONE FIELDS:', {
        customer_phone: ordData.data[0].customer_phone,
        customer_mobile: ordData.data[0].customer_mobile,
        billing_phone: ordData.data[0].billing_phone,
        shipping_phone: ordData.data[0].shipping_phone,
        others: ordData.data[0].others
      });
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
