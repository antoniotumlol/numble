const cacheName = 'numble-v1';
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

// Responder desde la caché si no hay internet
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
