const CACHE = 'star-growth-cabin-v40-layer-integrity';
const ASSETS = [
  './',
  './index.html',
  './style-v2.css?v=7',
  './nav-v4.css?v=7',
  './house-v3.css?v=7',
  './game-v4.css?v=7',
  './game-v5.css?v=7',
  './game-shell-v5.css?v=38',
  './app-v2.js?v=7',
  './house-v3.js?v=7',
  './wardrobe-engine-v5.js?v=7',
  './game-v4.js?v=7',
  './game-shell-v5.js?v=38',
  './manifest.webmanifest',
  './icon.svg',
  './assets/dressup-v38/base.webp?v=38',
  './assets/dressup-v38/composite.webp?v=38',
  './assets/dressup-v38/top.webp?v=38',
  './assets/dressup-v38/bottom.webp?v=38',
  './assets/dressup-v38/outer.webp?v=38',
  './assets/dressup-v38/shoes.webp?v=38',
  './assets/dressup-v38/thumb-top.webp?v=38',
  './assets/dressup-v38/thumb-bottom.webp?v=38',
  './assets/dressup-v38/thumb-outer.webp?v=38',
  './assets/dressup-v38/thumb-shoes.webp?v=38'
];

const MOBILE_LAYOUT_CSS = `
@media (max-width: 600px) {
  .dressupV32 .v32Wardrobe { min-height:100%; padding-bottom:calc(18px + env(safe-area-inset-bottom)); }
  .dressupV32 .v32CharacterPanel { height:clamp(285px,41dvh,340px)!important; min-height:285px!important; max-height:340px!important; align-items:center!important; overflow:hidden!important; }
  .dressupV32 .v32CharacterPanel:before { width:min(82vw,330px)!important; }
  .dressupV32 .v32Figure { width:min(88vw,350px)!important; height:100%!important; margin:0 auto!important; }
  .dressupV32 .v32Complete,.dressupV32 .v32Layer { width:100%!important; height:100%!important; object-fit:contain!important; object-position:50% 50%!important; }
  .dressupV32 .lookSummary { min-height:54px!important; padding:8px 16px!important; }
  .dressupV32 .v32Drawer { padding:12px 12px calc(20px + env(safe-area-inset-bottom))!important; }
  .dressupV32 .wardrobePanelHead { margin-bottom:8px!important; }
  .dressupV32 .dressTabs { gap:7px!important; padding-bottom:9px!important; scroll-snap-type:x proximity; }
  .dressupV32 .dressTabs button { min-width:68px!important; height:40px!important; padding:0 12px!important; scroll-snap-align:start; }
  .dressupV32 .v32Piece { min-height:142px!important; }
  .dressupV32 .v32Piece .pieceArt { height:142px!important; }
  .dressupV32 .v32SetCard,.dressupV32 .v32SetPreview { min-height:190px!important; }
  .dressupV32 .dressActions { position:static!important; bottom:auto!important; z-index:auto!important; margin:12px 0 0!important; padding:8px 0 10px!important; background:transparent!important; backdrop-filter:none!important; -webkit-backdrop-filter:none!important; }
  .dressupV32 .dressActions button { min-height:46px!important; }
  .dressScene { scroll-padding-top:8px; overscroll-behavior-y:contain; }
}
@media (max-width:390px) {
  .dressupV32 .v32CharacterPanel { height:clamp(275px,39dvh,320px)!important; min-height:275px!important; max-height:320px!important; }
  .dressupV32 .v32Figure { width:min(86vw,330px)!important; }
  .dressupV32 .dressTabs button { min-width:64px!important; padding:0 10px!important; }
}
`;

function patchGameShell(js) {
  // The base character must stay complete. Clothing covers it; clothing never erases body pixels.
  js = js.replace(' mask="url(#${maskId})"', '');

  // Coat first so its collar sits behind the knit top; shoes are rendered last at the feet.
  const oldOrder = "        ${look.bottom ? svgLayer('bottom') : ''}\n        ${look.top ? svgLayer('top') : ''}\n        ${look.shoes ? svgLayer('shoes') : ''}\n        ${look.outer ? svgLayer('outer') : ''}";
  const newOrder = "        ${look.outer ? svgLayer('outer') : ''}\n        ${look.bottom ? svgLayer('bottom') : ''}\n        ${look.top ? svgLayer('top') : ''}\n        ${look.shoes ? svgLayer('shoes') : ''}";
  js = js.replace(oldOrder, newOrder);

  // Keep the shoe bitmap unscaled and only correct its registered vertical anchor.
  js = js.replace(
    'class="v36SvgLayer ${slot}" href="${IMAGE[slot]}?v=${VERSION}" x="0" y="0" width="1254" height="1254" preserveAspectRatio="none"',
    'class="v36SvgLayer ${slot}" href="${IMAGE[slot]}?v=${VERSION}" x="0" y="0" width="1254" height="1254" preserveAspectRatio="none" ${slot === \'shoes\' ? \'transform="translate(0 -12)"\' : \'\'}'
  );
  return js;
}

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
  const url = new URL(event.request.url);
  const isGameShellCss = url.pathname.endsWith('/game-shell-v5.css');
  const isGameShellJs = url.pathname.endsWith('/game-shell-v5.js');

  if (isGameShellCss || isGameShellJs) {
    event.respondWith(
      fetch(event.request)
        .then(async response => {
          if (!response.ok) return response;
          const original = await response.text();
          const body = isGameShellCss ? `${original}\n${MOBILE_LAYOUT_CSS}` : patchGameShell(original);
          const transformed = new Response(body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              'Content-Type': isGameShellCss ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8',
              'Cache-Control': 'no-cache'
            }
          });
          const copy = transformed.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return transformed;
        })
        .catch(() => caches.match(event.request).then(hit => hit || caches.match(event.request, { ignoreSearch: true })))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match(event.request, { ignoreSearch: true })))
  );
});
