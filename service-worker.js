const CACHE_NAME = 'finanzas-pro-v3.1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './img/logo-512.png',
  './img/logo-192.png',
  './img/logo.png'
];

// Instalación del service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  // Forzar activación inmediata
  self.skipWaiting();
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediato
  return self.clients.claim();
});

// Interceptar peticiones y servir desde caché
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
