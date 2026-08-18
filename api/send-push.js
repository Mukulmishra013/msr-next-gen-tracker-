// Vercel Serverless Web Push Delivery API (Google FCM / Apple APNS / Windows WebPush)
import * as webpushModule from 'web-push';
import { createClient } from '@supabase/supabase-js';

const webpush = webpushModule.default || webpushModule;

const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || 'BENbeoBz5MJIMzlqyUeTyOMEuHZLnXlkdMfF8X_kbSmGZvjaWJAd0jDed5_6cGZdkUsKF_vXpM_uTiVDslhVboI';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'fk4pn7lIZe1VY9U_7qjuXFDcbDT4b2QhV7Ujx1wqsxM';
const VAPID_SUBJECT = 'mailto:mukulmishra013@gmail.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    if (res && res.status) return res.status(405).json({ error: 'Method not allowed' });
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { title, body: msgBody, targetUserId, url } = body;

    const pushPayload = JSON.stringify({
      title: title || '👑 Mukul Mishra (Admin Directive)',
      body: msgBody || 'MSR Agency Tracker ne urgent update send kiya hai.',
      icon: '/assets/maya_avatar.jpg',
      badge: '/assets/maya_avatar.jpg',
      url: url || '/',
      timestamp: Date.now()
    });

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, phone, role_label');

    if (error || !users) {
      if (res && res.status) return res.status(200).json({ success: true, delivered: 0, message: 'No users found' });
      return new Response(JSON.stringify({ success: true, delivered: 0 }), { status: 200 });
    }

    const deliveryPromises = [];

    users.forEach((u) => {
      if (targetUserId && targetUserId !== 'ALL' && u.id !== targetUserId) {
        return;
      }

      if (u.role_label && u.role_label.includes('[PUSH_SUB]')) {
        try {
          const match = u.role_label.match(/\[PUSH_SUB\](.*?)\[\/PUSH_SUB\]/s);
          if (match && match[1]) {
            const sub = JSON.parse(match[1]);
            if (sub && sub.endpoint) {
              deliveryPromises.push(
                webpush.sendNotification(sub, pushPayload, {
                  TTL: 60 * 60 * 24,
                  urgency: 'high'
                }).catch((err) => {
                  console.warn('Push delivery failed:', u.name, err.statusCode);
                })
              );
            }
          }
        } catch (e) {}
      }
    });

    const results = await Promise.allSettled(deliveryPromises);
    const successfulCount = results.filter((r) => r.status === 'fulfilled').length;

    const responseData = {
      success: true,
      delivered: successfulCount,
      totalAttempted: deliveryPromises.length
    };

    if (res && res.status) return res.status(200).json(responseData);
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('send-push API error:', err);
    if (res && res.status) return res.status(500).json({ success: false, error: err.message });
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
