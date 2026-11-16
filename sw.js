/* Our Kitchen service worker — offline support.
   VERSION and the PRECACHE list are rewritten by tools/build_index.py. */
const VERSION = '4eff691208';
const CACHE = 'our-kitchen-' + VERSION;
const PRECACHE = /*PRECACHE*/[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/grain.png",
  "./assets/img/cover.webp",
  "./assets/img/moms-potato-soup.webp",
  "./assets/tiles/beef-turkey.webp",
  "./assets/tiles/chicken.webp",
  "./assets/tiles/comfort-soups.webp",
  "./assets/tiles/heart.webp",
  "./assets/tiles/pasta-italian.webp",
  "./assets/tiles/seafood.webp",
  "./assets/tiles/steak-pork.webp",
  "./assets/tiles/takeout-at-home.webp",
  "./css/app.css",
  "./fonts/Cinzel.woff2",
  "./fonts/InstrumentSerif-Italic.woff2",
  "./fonts/InstrumentSerif-Regular.woff2",
  "./fonts/Outfit.woff2",
  "./icons/alt-plum-apple-touch-icon.png",
  "./icons/alt-plum-icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg",
  "./js/app.js",
  "./recipes/categories.json",
  "./recipes/index.json",
  "./recipes/comfort-soups/01-moms-famous-potato-soup.json"
]/*END*/;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('our-kitchen-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first for pages and recipe data (so new recipes show up), cache-first for everything else.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const fresh = req.mode === 'navigate' || url.pathname.endsWith('.json') || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  if (fresh) {
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((m) => m || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
    );
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((m) => m || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }))
  );
});
