// ============================================================
// ⚙️ service-worker.js — Finanzas Pro v3.2
// ============================================================
// Objetivo:
// - Cachear recursos estáticos para funcionamiento offline.
// - Mantener actualizado el contenido al detectar una nueva versión.
// - Compatible con estructura modular ES (import/export).
// ============================================================

const CACHE_NAME = 'finanzas-pro-v3.2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './img/logo.png',
  './img/logo-192.png',
  './img/logo-512.png',

  // JS principales
  './js/app.js',
  './js/auth.js',
  './js/pin-user.js',
  './js/login-bootstrap.js',
  './js/storage.js',
  './js/formatters.js',
  './js/arg-data.js',

  // Componentes
  './components/informes.js',
  './components/resumen.js',
  './components/header.js',
  './components/tabs.js',
  './components/ingresos.js',
  './components/gastos-fijos.js',
  './components/gastos-variables.js',
  './components/tarjetas.js',
  './components/prestamos.js',
  './components/ahorros.js',
  './components/presupuestos.js',
  './components/historial.js',

  // CSS principal
  './css/styles.css'
];

// ============================================================
// 🧩 INSTALL — Carga inicial de recursos al caché
// ============================================================
self.addEventListener('install', event => {
  console.log('[SW] Instalando Finanzas Pro v3.2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => console.log('[SW] Archivos cacheados correctamente'))
      .catch(err => console.warn('[SW] Error al cachear:', err))
  );
  self.skipWaiting();
});

// ============================================================
// 🔁 ACTIVATE — Limpieza de versiones antiguas
// ============================================================
self.addEventListener('activate', event => {
  console.log('[SW] Activando nueva versión...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log(`[SW] Eliminando caché antiguo: ${k}`);
          return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

// ============================================================
// 🌐 FETCH — Intercepta peticiones y sirve desde caché si existe
// ============================================================
self.addEventListener('fetch', event => {
  const req = event.request;

  // Evita interferir con solicitudes dinámicas (ej: APIs externas)
  if (req.url.includes('dolarapi.com') || req.url.startsWith('chrome-extension')) return;

  event.respondWith(
    caches.match(req)
      .then(cached => {
        if (cached) return cached;
        return fetch(req)
          .then(res => {
            // Cachear dinámicamente solo archivos de la misma app
            if (req.url.startsWith(self.location.origin)) {
              const clone = res.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => {
            // Fallback offline opcional: mostrar mensaje o recurso local
            if (req.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});