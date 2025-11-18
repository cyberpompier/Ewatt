const CACHE_NAME = 'electric-cost-calculator-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://aistudiocdn.com/react@18.2.0',
  'https://aistudiocdn.com/react-dom@18.2.0/client',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Use a network-first, falling back to cache strategy.
  // This ensures users get the latest content when online,
  // but the app still works offline.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (
          !response ||
          response.status !== 200 ||
          event.request.method !== 'GET'
        ) {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Network request failed, try to get it from the cache.
        return caches.match(event.request)
          .then(response => {
            return response; // Will be undefined if not in cache.
          });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
