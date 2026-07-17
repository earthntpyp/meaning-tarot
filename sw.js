/* Meaning Tarot — Service Worker: offline cache + push notifications */
const CACHE = 'mt-v20';
const CORE = ['/', '/index.html', '/app.js?v=20', '/deck.js?v=20', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Stale-while-revalidate for same-origin GET (cards, fonts CSS pass through) */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      const cached = await c.match(e.request);
      const fetched = fetch(e.request).then(resp => {
        if (resp.ok) c.put(e.request, resp.clone());
        return resp;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});

/* Push notification */
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data.json(); } catch (err) {}
  e.waitUntil(self.registration.showNotification(
    data.title || '🔮 Meaning Tarot',
    {
      body: data.body || 'ไพ่ประจำวันของคุณรออยู่ — เปิดดูพลังงานวันนี้เลย',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    }
  ));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
