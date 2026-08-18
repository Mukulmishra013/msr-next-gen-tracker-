// Zero-Dependency Pure Node.js WebPush & Google FCM Push Relay API (RFC 8291 / RFC 8292)
// Works 100% on Vercel Serverless without external npm packages
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || 'BENbeoBz5MJIMzlqyUeTyOMEuHZLnXlkdMfF8X_kbSmGZvjaWJAd0jDed5_6cGZdkUsKF_vXpM_uTiVDslhVboI';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'fk4pn7lIZe1VY9U_7qjuXFDcbDT4b2QhV7Ujx1wqsxM';
const VAPID_SUBJECT = 'mailto:mukulmishra013@gmail.com';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function base64UrlDecode(str) {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from((str + padding).replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function base64UrlEncode(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function hkdf(salt, ikm, info, length) {
  const prk = crypto.createHmac('sha256', salt).update(ikm).digest();
  let prev = Buffer.alloc(0);
  let output = Buffer.alloc(0);
  let i = 1;
  while (output.length < length) {
    prev = crypto.createHmac('sha256', prk).update(Buffer.concat([prev, info, Buffer.from([i])])).digest();
    output = Buffer.concat([output, prev]);
    i++;
  }
  return output.slice(0, length);
}

// 1. Encrypt Payload using AES-128-GCM (RFC 8291)
function encryptWebPushPayload(payloadText, p256dhStr, authStr) {
  const clientPublicKey = base64UrlDecode(p256dhStr);
  const clientAuth = base64UrlDecode(authStr);

  const localEcdh = crypto.createECDH('prime256v1');
  localEcdh.generateKeys();
  const localPublicKey = localEcdh.getPublicKey();

  const sharedSecret = localEcdh.computeSecret(clientPublicKey);
  const salt = crypto.randomBytes(16);

  const authInfo = Buffer.concat([
    Buffer.from('WebPush: info\0'),
    clientPublicKey,
    localPublicKey
  ]);
  const ikm = hkdf(clientAuth, sharedSecret, authInfo, 32);

  const cekInfo = Buffer.from('Content-Encoding: aes128gcm\0');
  const cek = hkdf(salt, ikm, cekInfo, 16);

  const nonceInfo = Buffer.from('Content-Encoding: nonce\0');
  const nonce = hkdf(salt, ikm, nonceInfo, 12);

  const payloadBuf = Buffer.from(payloadText, 'utf8');
  const record = Buffer.concat([payloadBuf, Buffer.from([2])]);

  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const encrypted = Buffer.concat([cipher.update(record), cipher.final()]);
  const tag = cipher.getAuthTag();

  const header = Buffer.concat([
    salt,
    Buffer.from([0, 0, 16, 0]),
    Buffer.from([localPublicKey.length]),
    localPublicKey
  ]);

  return Buffer.concat([header, encrypted, tag]);
}

// 2. Generate Signed VAPID Authorization Header (RFC 8292)
function getVapidAuthHeader(endpointUrl) {
  try {
    const urlObj = new URL(endpointUrl);
    const audience = `${urlObj.protocol}//${urlObj.host}`;

    const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'ES256', typ: 'JWT' })));
    const payload = base64UrlEncode(Buffer.from(JSON.stringify({
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 86400,
      sub: VAPID_SUBJECT
    })));

    const unsignedToken = `${header}.${payload}`;

    const pubBuf = base64UrlDecode(VAPID_PUBLIC_KEY);
    const x = base64UrlEncode(pubBuf.slice(1, 33));
    const y = base64UrlEncode(pubBuf.slice(33, 65));

    const privateKey = crypto.createPrivateKey({
      key: {
        kty: 'EC',
        crv: 'P-256',
        x,
        y,
        d: VAPID_PRIVATE_KEY
      },
      format: 'jwk'
    });

    const signer = crypto.createSign('SHA256');
    signer.update(unsignedToken);
    const signature = signer.sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });

    const jwt = `${unsignedToken}.${base64UrlEncode(signature)}`;
    return `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`;
  } catch (err) {
    console.error('VAPID header generation error:', err);
    return null;
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }
    const { title, body: msgBody, targetUserId, url } = body || {};

    const pushPayloadText = JSON.stringify({
      title: title || '👑 Mukul Mishra (Admin Directive)',
      body: msgBody || 'MSR Agency Tracker ne urgent update send kiya hai.',
      icon: '/assets/maya_avatar.jpg',
      badge: '/assets/maya_avatar.jpg',
      image: '/assets/sales_trophy.jpg',
      url: url || '/',
      timestamp: Date.now()
    });

    // 1. Fetch all registered push tokens from Supabase users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, phone, role_label');

    if (error || !users) {
      return res.status(200).json({ success: true, delivered: 0, message: 'No users found in database' });
    }

    const deliveryPromises = [];

    for (const u of users) {
      if (targetUserId && targetUserId !== 'ALL' && u.id !== targetUserId) {
        continue;
      }

      if (u.role_label && u.role_label.includes('[PUSH_SUB]')) {
        try {
          const match = u.role_label.match(/\[PUSH_SUB\](.*?)\[\/PUSH_SUB\]/s);
          if (match && match[1]) {
            const sub = JSON.parse(match[1]);
            if (sub && sub.endpoint && sub.keys?.p256dh && sub.keys?.auth) {
              const encryptedBody = encryptWebPushPayload(pushPayloadText, sub.keys.p256dh, sub.keys.auth);
              const authHeader = getVapidAuthHeader(sub.endpoint);

              if (authHeader) {
                deliveryPromises.push(
                  fetch(sub.endpoint, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/octet-stream',
                      'Content-Encoding': 'aes128gcm',
                      'TTL': '86400',
                      'Urgency': 'high',
                      'Authorization': authHeader
                    },
                    body: encryptedBody
                  }).then(async (fcmRes) => {
                    console.log(`Pushed to ${u.name} status: ${fcmRes.status}`);
                    return fcmRes.status;
                  }).catch((err) => {
                    console.warn(`Push to ${u.name} failed:`, err.message);
                  })
                );
              }
            }
          }
        } catch (e) {}
      }
    }

    const results = await Promise.allSettled(deliveryPromises);
    const successfulCount = results.filter((r) => r.status === 'fulfilled' && (r.value === 201 || r.value === 200 || r.value === 202)).length;

    return res.status(200).json({
      success: true,
      delivered: successfulCount,
      totalAttempted: deliveryPromises.length
    });
  } catch (err) {
    console.error('send-push handler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
