// ObstétriLog — Service Worker
// Cache stratégie : Cache First pour les assets, Network First pour les données

const CACHE_NAME = 'obstetrolog-simon_crequit-v1';

// À l'installation : mettre en cache les fichiers de l'app
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        '../../manifest.json',
        '../../icons/icon-192.png',
        '../../icons/icon-512.png',
      ]);
    })
  );
  self.skipWaiting();
});

// À l'activation : nettoyer les anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch : Cache First — l'app fonctionne hors-ligne
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Mettre en cache les nouvelles ressources
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Hors-ligne et pas en cache : rien à faire
        return new Response('Hors-ligne', { status: 503 });
      });
    })
  );
});
