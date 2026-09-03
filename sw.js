const CACHE = 'star-growth-cabin-v33-hd-layers';
const ASSETS = [
  './',
  './index.html',
  './style-v2.css?v=7',
  './nav-v4.css?v=7',
  './house-v3.css?v=7',
  './game-v4.css?v=7',
  './game-v5.css?v=7',
  './game-shell-v5.css?v=33',
  './app-v2.js?v=7',
  './house-v3.js?v=7',
  './wardrobe-engine-v5.js?v=7',
  './game-v4.js?v=7',
  './game-shell-v5.js?v=33',
  './manifest.webmanifest',
  './icon.svg',
  './assets/dressup-v33/base.webp?v=33',
  './assets/dressup-v33/base-bottom-hidden.webp?v=33',
  './assets/dressup-v33/top.webp?v=33',
  './assets/dressup-v33/bottom.webp?v=33',
  './assets/dressup-v33/outer.webp?v=33',
  './assets/dressup-v33/shoes.webp?v=33',
  './assets/dressup-v33/thumb-top.webp?v=33',
  './assets/dressup-v33/thumb-bottom.webp?v=33',
  './assets/dressup-v33/thumb-outer.webp?v=33',
  './assets/dressup-v33/thumb-shoes.webp?v=33'
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
