const CACHE='star-growth-cabin-v21';
const ASSETS=['./','./index.html','./style-v2.css?v=7','./nav-v4.css?v=7','./house-v3.css?v=7','./game-v4.css?v=7','./game-v5.css?v=7','./game-shell-v5.css?v=10','./app-v2.js?v=7','./house-v3.js?v=7','./wardrobe-engine-v5.js?v=7','./game-v4.js?v=7','./game-shell-v5.js?v=10','./manifest.webmanifest','./icon.svg','./assets/dressup-2d/base-approved.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request))));
