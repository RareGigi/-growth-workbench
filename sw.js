const CACHE='star-growth-cabin-v25';
const ASSETS=['./','./index.html','./style-v2.css?v=7','./nav-v4.css?v=7','./house-v3.css?v=7','./game-v4.css?v=7','./game-v5.css?v=7','./game-shell-v5.css?v=23','./app-v2.js?v=7','./house-v3.js?v=7','./wardrobe-engine-v5.js?v=7','./game-v4.js?v=7','./game-shell-v5.js?v=25','./manifest.webmanifest','./icon.svg','./assets/dressup-2d/base-approved.webp','./assets/avatar-v5/mist-city-walk-preview.png','./assets/dressup-v24/mist-top.webp','./assets/dressup-v24/mist-bottom.webp','./assets/dressup-v24/mist-outer-back.webp','./assets/dressup-v24/mist-shoes.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const original=new URL(event.request.url);
  const wardrobeShell=/\/game-shell-v5\.(?:js|css)$/.test(original.pathname);
  let request=event.request;
  if(wardrobeShell){
    original.search=original.pathname.endsWith('.js')?'?v=25':'?v=23';
    request=new Request(original.toString(),{method:'GET',headers:event.request.headers,mode:event.request.mode,credentials:event.request.credentials,redirect:event.request.redirect,cache:'reload'});
  }
  event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));return response}).catch(()=>caches.match(request).then(hit=>hit||caches.match(event.request))));
});
