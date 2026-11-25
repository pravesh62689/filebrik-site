// FileBrik Service Worker for optional push notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Your file is ready to download.',
        icon: data.icon || '/favicon.svg',
        badge: '/badge.png',
        data: { url: data.url || '/' }
      };
      event.waitUntil(self.registration.showNotification(data.title || 'FileBrik Alert', options));
    } catch (e) {
      // standard push payload
      event.waitUntil(self.registration.showNotification('FileBrik', { body: event.data.text() }));
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
