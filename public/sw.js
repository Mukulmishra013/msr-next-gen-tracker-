// MSR Next-Gen Enterprise PWA Service Worker & Push Notification Hub
const CACHE_NAME = 'msr-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 🔔 Handle Incoming Push Notifications from Server / Maya AI / Admin
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'MSR System Alert', body: event.data ? event.data.text() : 'New update from MSR Next-Gen' };
  }

  const title = data.title || '🚨 MSR Supervisor Alert';
  const options = {
    body: data.body || 'Maya AI HR ne new instructions update kiye hain.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 300],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_app', title: '📱 Open App' },
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
