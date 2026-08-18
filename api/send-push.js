// Vercel Serverless Web Push Delivery API (Google FCM / Apple APNS / Windows WebPush)
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || 'BENbeoBz5MJIMzlqyUeTyOMEuHZLnXlkdMfF8X_kbSmGZvjaWJAd0jDed5_6cGZdkUsKF_vXpM_uTiVDslhVboI';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'fk4pn7lIZe1VY9U_7qjuXFDcbDT4b2QhV7Ujx1wqsxM';
const VAPID_SUBJECT = 'mailto:mukulmishra013@gmail.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://blnvunejbmkpckwrdyfy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, targetUserId, url, icon } = req.body || {};

    const pushPayload = JSON.stringify({
      title: title || '👑 MSR Next-Gen Alert',
      body: body || 'New update from MSR Agency Tracker',
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      url: url || '/',
      timestamp: Date.now()
    });

    // 1. Fetch all registered push subscriptions from Supabase users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, phone, notes');

    if (error || !users) {
      return res.status(200).json({ success: true, delivered: 0, message: 'No users table found' });
    }

    const deliveryPromises = [];

    users.forEach((u) => {
      // If targeting a specific user or ALL
      if (targetUserId && targetUserId !== 'ALL' && u.id !== targetUserId) {
        return;
      }

      if (u.notes && u.notes.includes('[PUSH_SUB]')) {
        try {
          const match = u.notes.match(/\[PUSH_SUB\](.*?)\[\/PUSH_SUB\]/s);
          if (match && match[1]) {
            const sub = JSON.parse(match[1]);
            if (sub && sub.endpoint) {
              deliveryPromises.push(
                webpush.sendNotification(sub, pushPayload).catch((err) => {
                  console.warn('Push delivery failed for user:', u.name, err.statusCode);
                })
              );
            }
          }
        } catch (e) {}
      }
    });

    const results = await Promise.allSettled(deliveryPromises);
    const successfulCount = results.filter((r) => r.status === 'fulfilled').length;

    return res.status(200).json({
      success: true,
      delivered: successfulCount,
      totalAttempted: deliveryPromises.length
    });
  } catch (err) {
    console.error('send-push API error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
