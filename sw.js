/* Our Kitchen service worker — offline support.
   VERSION and the PRECACHE list are rewritten by tools/build_index.py. */
const VERSION = '625a4d55b5';
const CACHE = 'our-kitchen-' + VERSION;
const VENDOR = 'ok-vendor-tesseract-5.1.1';
const PRECACHE = /*PRECACHE*/[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/grain.png",
  "./assets/img/air-fryer-honey-garlic-chicken-sm.webp",
  "./assets/img/air-fryer-honey-garlic-chicken.webp",
  "./assets/img/baked-mac-and-cheese-sm.webp",
  "./assets/img/baked-mac-and-cheese.webp",
  "./assets/img/beef-tacos-sm.webp",
  "./assets/img/beef-tacos.webp",
  "./assets/img/broccoli-cheddar-soup-sm.webp",
  "./assets/img/broccoli-cheddar-soup.webp",
  "./assets/img/chicken-alfredo-sm.webp",
  "./assets/img/chicken-alfredo.webp",
  "./assets/img/chicken-fried-rice-sm.webp",
  "./assets/img/chicken-fried-rice.webp",
  "./assets/img/chicken-parm-spaghetti-sm.webp",
  "./assets/img/chicken-parm-spaghetti.webp",
  "./assets/img/cover.webp",
  "./assets/img/creamy-garlic-parmesan-chicken-sm.webp",
  "./assets/img/creamy-garlic-parmesan-chicken.webp",
  "./assets/img/garlic-butter-steak-bites-sm.webp",
  "./assets/img/garlic-butter-steak-bites.webp",
  "./assets/img/honey-garlic-salmon-sm.webp",
  "./assets/img/honey-garlic-salmon.webp",
  "./assets/img/moms-potato-soup-sm.webp",
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
  "./recipes/prices.json",
  "./recipes/beef-turkey/01-beef-tacos.json",
  "./recipes/chicken/01-air-fryer-crispy-honey-garlic-chicken.json",
  "./recipes/chicken/02-chicken-parm-with-spaghetti.json",
  "./recipes/chicken/03-creamy-garlic-parmesan-chicken-with-mashed-potatoes.json",
  "./recipes/comfort-soups/01-moms-famous-potato-soup.json",
  "./recipes/comfort-soups/02-broccoli-cheddar-soup.json",
  "./recipes/pasta-italian/01-chicken-alfredo.json",
  "./recipes/pasta-italian/05-baked-mac-and-cheese.json",
  "./recipes/seafood/01-honey-garlic-salmon.json",
  "./recipes/steak-pork/01-garlic-butter-steak-bites.json",
  "./recipes/takeout-at-home/02-chicken-fried-rice.json"
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
  // the receipt reader (vendor/) lives in its own cache so app updates don't make phones re-download it
  if (url.pathname.includes('/vendor/')) {
    e.respondWith(
      caches.open(VENDOR).then((c) => c.match(req, { ignoreSearch: true }).then((m) => m || fetch(req).then((res) => {
        if (res.ok) c.put(req, res.clone());
        return res;
      })))
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
