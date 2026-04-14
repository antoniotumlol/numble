const cacheName = 'numble-v2';
const staticAssets = [
  './',
  './index.html',
  './manifest.json'
];

// Instalación y cacheo de archivos básicos
self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== cacheName)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Responder desde la caché si no hay internet
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
