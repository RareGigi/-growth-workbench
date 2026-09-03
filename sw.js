const CACHE = 'star-growth-cabin-v32-fixed-wardrobe';
const ASSETS = [
  './',
  './index.html',
  './style-v2.css?v=7',
  './nav-v4.css?v=7',
  './house-v3.css?v=7',
  './game-v4.css?v=7',
  './game-v5.css?v=7',
  './game-shell-v5.css?v=32',
  './app-v2.js?v=7',
  './house-v3.js?v=7',
  './wardrobe-engine-v5.js?v=7',
  './game-v4.js?v=7',
  './game-shell-v5.js?v=32',
  './manifest.webmanifest',
  './icon.svg',
  './assets/dressup-v32/base.webp?v=32',
  './assets/dressup-v32/top.webp?v=32',
  './assets/dressup-v32/bottom.webp?v=32',
  './assets/dressup-v32/outer.webp?v=32',
  './assets/dressup-v32/shoes.webp?v=32',
  './assets/dressup-v32/composite.webp?v=32'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match(event.request, { ignoreSearch: true })))
  );
});
