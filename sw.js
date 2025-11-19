const CACHE_NAME = 'electric-cost-calculator-v7';

// Liste précise des fichiers à mettre en cache pour le fonctionnement hors ligne
// Inclut les fichiers locaux et les dépendances externes (esm.sh, google fonts)
const urlsToCache = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json',
  './icon.svg',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'
];

self.addEventListener('install', (event) => {
  // Force l'activation immédiate du nouveau service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Ouverture du cache et ajout des fichiers essentiels');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error('Erreur lors de la mise en cache des fichiers:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Nettoyage des anciens caches pour éviter les conflits de version
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prendre le contrôle immédiat des clients (pages ouvertes)
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la retourne immédiatement
        if (response) {
          return response;
        }

        // Sinon, on la récupère sur le réseau
        return fetch(event.request).then(
          (response) => {
            // Vérification basique de la réponse
            if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
              return response;
            }

            // On clone la réponse car elle ne peut être lue qu'une seule fois
            const responseToCache = response.clone();

            // On met en cache la nouvelle ressource pour la prochaine fois
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});