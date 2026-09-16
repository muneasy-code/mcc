const STATIC_CACHE = 'mcc-pwa-static-v2';
const STATIC_ASSETS = new Set([
  '/manifest.webmanifest',
  '/pwa-192-v4.png',
  '/pwa-512-v4.png'
]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll([...STATIC_ASSETS]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('mcc-pwa-static-') && key !== STATIC_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (STATIC_ASSETS.has(url.pathname)) {
    event.respondWith(
      fetch(event.request, { cache:'no-store' }).then(response => {
        const copy = response.clone();
        caches.open(STATIC_CACHE).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(fetch(event.request));
});
