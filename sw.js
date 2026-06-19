// Deutsch Drill service worker — network-first
// Prova sempre la rete (così gli aggiornamenti si vedono subito), cache solo come fallback offline.
const CACHE = 'deutsch-drill-v2';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))); // butta le cache vecchie
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  e.respondWith((async () => {
    try {
      const fresh = await fetch(e.request);              // 1) prova la rete
      const cache = await caches.open(CACHE);
      cache.put(e.request, fresh.clone());               // 2) aggiorna la cache
      return fresh;
    } catch (err) {
      const cached = await caches.match(e.request);      // 3) offline: usa la cache
      return cached || caches.match('./index.html');
    }
  })());
});
