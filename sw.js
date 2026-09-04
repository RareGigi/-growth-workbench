const CACHE = 'star-growth-cabin-v37-anchor-calibrated';
const ASSETS = [
  './',
  './index.html',
  './style-v2.css?v=7',
  './nav-v4.css?v=7',
  './house-v3.css?v=7',
  './game-v4.css?v=7',
  './game-v5.css?v=7',
  './game-shell-v5.css?v=37',
  './app-v2.js?v=7',
  './house-v3.js?v=7',
  './wardrobe-engine-v5.js?v=7',
  './game-v4.js?v=7',
  './game-shell-v5.js?v=37',
  './manifest.webmanifest',
  './icon.svg',
  './assets/dressup-v37/base.webp?v=37',
  './assets/dressup-v37/composite.webp?v=37',
  './assets/dressup-v37/top.webp?v=37',
  './assets/dressup-v37/bottom.webp?v=37',
  './assets/dressup-v37/outer.webp?v=37',
  './assets/dressup-v37/shoes.webp?v=37',
  './assets/dressup-v37/thumb-top.webp?v=37',
  './assets/dressup-v37/thumb-bottom.webp?v=37',
  './assets/dressup-v37/thumb-outer.webp?v=37',
  './assets/dressup-v37/thumb-shoes.webp?v=37'
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
