async function testNdr() {
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
    console.log('TOKEN:', authData.token ? 'GOT TOKEN' : 'FAILED');

    if (authData.token) {
      // 1. Try /ndr/all
      const ndrRes = await fetch('https://apiv2.shiprocket.in/v1/external/ndr/all', {
        headers: { 'Authorization': `Bearer ${authData.token}` }
      });
      const ndrData = await ndrRes.json();
      console.log('NDR ALL STATUS:', ndrRes.status);
      console.log('NDR ALL COUNT:', ndrData?.data?.length || ndrData?.length);
      if (ndrData?.data?.[0]) {
        console.log('SAMPLE NDR RECORD:', ndrData.data[0]);
      }
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}
testNdr();
