async function test1stAttempt() {
  try {
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'atulmishra9506348351@gmail.com',
        password: 'k87oHWzmv6^9u8yxZsur8sw@G$DI0Od0'
      })
    });
    const authData = await authRes.json();
    const token = authData.token;

    // Test NDR Action on 1st Attempt: 19041945592696
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/ndr/19041945592696/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        action: 're-attempt',
        deferred_date: '2026-08-18',
        comments: 'Customer wants delivery tomorrow',
        phone: '8887521156'
      })
    });
    const data = await res.json();
    console.log('1ST ATTEMPT RES:', res.status, data);
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test1stAttempt();
