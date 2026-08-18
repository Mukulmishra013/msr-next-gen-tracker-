// MSR Next-Gen Enterprise PWA Service Worker & Native Web Push Hub
const CACHE_NAME = 'msr-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 🔔 Handle Incoming Native OS Push Notifications (Fires even when app is closed or screen is off)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: '👑 MSR Admin Alert', body: event.data ? event.data.text() : 'New notification received' };
  }

  const title = data.title || '🚨 MSR Supervisor & Admin Alert';
  const options = {
    body: data.body || 'MSR Agency Tracker ne urgent update send kiya hai.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [300, 100, 400, 100, 300],
    requireInteraction: true,
    tag: 'msr-broadcast-alert',
    renotify: true,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_app', title: '📱 Open Portal' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
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
