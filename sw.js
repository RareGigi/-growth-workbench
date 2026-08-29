const CACHE='star-growth-cabin-v6';
const ASSETS=['./','./index.html','./style-v2.css?v=6','./nav-v4.css?v=6','./house-v3.css?v=6','./game-v4.css?v=6','./game-v5.css?v=6','./game-shell-v5.css?v=6','./app-v2.js?v=6','./house-v3.js?v=6','./wardrobe-engine-v5.js?v=6','./game-v4.js?v=6','./game-shell-v5.js?v=6','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request))));
