// MSR Next-Gen Enterprise PWA Service Worker & Native Web Push Hub
const CACHE_NAME = 'msr-pwa-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 🔔 Handle Incoming Native OS Push Notifications (Fires when app is closed or removed from recent apps)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '👑 Mukul Mishra (Admin Directive)', body: event.data ? event.data.text() : 'New alert received' };
  }

  const title = data.title || '👑 Mukul Mishra (Admin Directive)';
  const options = {
    body: data.body || 'MSR Agency Tracker ne urgent update send kiya hai.',
    icon: '/assets/maya_avatar.jpg',
    badge: '/assets/maya_avatar.jpg',
    image: '/assets/sales_trophy.jpg',
    vibrate: [300, 100, 400, 100, 300],
    requireInteraction: true,
    tag: 'msr-push-alert-' + Date.now(),
    renotify: true,
    silent: false,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_app', title: '📱 Open MSR Portal' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 📱 Handle Periodic Background Sync (Wakes up closed app in background on Android)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'msr-cloud-check') {
    event.waitUntil(
      fetch('https://blnvunejbmkpckwrdyfy.supabase.co/rest/v1/users?select=role_label&or=(phone.eq.%2B918887521156,role.eq.owner)&limit=1', {
        headers: {
          'apikey': 'sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z',
          'Authorization': 'Bearer sb_publishable_4sR9yc91hhMMtN9kpIpTqw_n8-muO3Z'
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data[0]?.role_label?.includes('[ADMIN_BROADCAST]')) {
          const match = data[0].role_label.match(/\[ADMIN_BROADCAST\](.*?)\[\/ADMIN_BROADCAST\]/s);
          if (match && match[1]) {
            const payload = JSON.parse(match[1]);
            const isFresh = Date.now() - Number(payload.timestamp || 0) < 15 * 60 * 1000;
            if (isFresh) {
              return self.registration.showNotification(payload.title || '👑 Mukul Mishra (Admin Directive)', {
                body: payload.body,
                icon: '/assets/maya_avatar.jpg',
                badge: '/assets/maya_avatar.jpg',
                vibrate: [300, 100, 400],
                tag: 'msr-alert-' + payload.id,
                renotify: true,
                requireInteraction: true
              });
            }
          }
        }
      })
      .catch(() => {})
    );
  }
});

// 📱 Handle Notification Click (Focus or Open App Window)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
