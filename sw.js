const CACHE_NAME = 'electric-cost-calculator-v3';
// Cache a minima l'essentiel pour le shell de l'application.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Stratégie pour les dépendances externes (CDN, polices) :
  // Stale-While-Revalidate : On sert depuis le cache pour la vitesse,
  // puis on met à jour le cache en arrière-plan.
  if (url.origin === 'https://aistudiocdn.com' || url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  
  // Stratégie pour les autres requêtes (ex: /index.tsx):
  // Network First : On essaie d'abord le réseau pour avoir les dernières mises à jour,
  // et on se rabat sur le cache si le réseau est indisponible.
  event.respondWith(
    fetch(request)
      .then(response => {
        // Si la requête réseau réussit, on met à jour le cache
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si la requête réseau échoue, on cherche dans le cache
        return caches.match(request).then(response => {
          // Si on est en mode navigation (chargement de page) et que la requête n'est pas dans le cache,
          // on renvoie la page principale de l'application (le shell).
          if (request.mode === 'navigate' && !response) {
            return caches.match('/');
          }
          return response;
        });
      })
  );
});
