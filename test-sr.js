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
      console.log('ORDERS COUNT:', ordData?.data?.length);
      if (ordData?.data?.[0]) {
        console.log('SAMPLE ORDER:', {
          id: ordData.data[0].id,
          customer_name: ordData.data[0].customer_name,
          phone: ordData.data[0].customer_phone || ordData.data[0].customer_mobile,
          status: ordData.data[0].status,
          awb: ordData.data[0].shipments?.[0]?.awb
        });
      }
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
